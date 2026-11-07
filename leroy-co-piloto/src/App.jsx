/**
 * @license
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  PRODUTOS_CATALOGO,
  CLIENTE_DEMO,
  VENDEDORES_DISPONIVEIS,
  LISTAS_PREDEFINIDAS
} from './data/mockStoreData.js';
import { ordenarRota } from './services/routeEngine.js';
import { FilaAtendimentoRuptura, criarChamadoRuptura, chamadoEstaAberto } from './services/queueEngine.js';
import { carregarEstado, salvarEstado, assinarMudancas } from './services/persistencia.js';
import { lerCorredorDaUrl, limparCorredorDaUrl } from './services/qrCorredor.js';
import { Header } from './components/Header.jsx';
import { ClientMissionView } from './components/ClientMissionView.jsx';
import { SellerConsultantView } from './components/SellerConsultantView.jsx';
import { QrPlacasView } from './components/QrPlacasView.jsx';

const criarItensDaLista = (produtosSkus) =>
  PRODUTOS_CATALOGO
    .filter(p => produtosSkus.includes(p.sku))
    .map((p, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      produto: p,
      quantidade: p.categoria === 'MATERIAIS_CONSTRUCAO' ? 3 : 1,
      coletado: false
    }));

// Estado de partida da demonstração: kit de Reforma de Banheiro
const criarEstadoInicial = () => {
  const listaInicial = LISTAS_PREDEFINIDAS[0];
  return {
    cliente: CLIENTE_DEMO,
    vendedorAtivo: VENDEDORES_DISPONIVEIS[0],
    itensRota: ordenarRota(criarItensDaLista(listaInicial.produtosSkus)),
    chamadosFila: [],
    mensageriaLog: [],
    kitAtivo: listaInicial.nome,
    localizacao: null,
    dadosOtimizacaoIA: null
  };
};

export default function App() {
  const [estadoInicial] = useState(() => carregarEstado() ?? criarEstadoInicial());

  const [visaoAtiva, setVisaoAtiva] = useState('CLIENTE');
  const [cliente, setCliente] = useState(estadoInicial.cliente);
  const [vendedorAtivo, setVendedorAtivo] = useState(estadoInicial.vendedorAtivo);
  const [itensRota, setItensRota] = useState(estadoInicial.itensRota);
  const [kitAtivo, setKitAtivo] = useState(estadoInicial.kitAtivo);
  const [localizacao, setLocalizacao] = useState(estadoInicial.localizacao);
  const [qrInvalido, setQrInvalido] = useState(null);

  const [filaEngine] = useState(
    () => new FilaAtendimentoRuptura(estadoInicial.chamadosFila, estadoInicial.mensageriaLog)
  );
  const [chamadosFila, setChamadosFila] = useState(estadoInicial.chamadosFila);
  const [mensageriaLog, setMensageriaLog] = useState(estadoInicial.mensageriaLog);

  // Integração com OpenRouter AI
  const [dadosOtimizacaoIA, setDadosOtimizacaoIA] = useState(estadoInicial.dadosOtimizacaoIA ?? null);
  const [otimizandoIA, setOtimizandoIA] = useState(false);
  const [erroOtimizacaoIA, setErroOtimizacaoIA] = useState(null);
  const [statusOpenRouter, setStatusOpenRouter] = useState(null);
  const pedidoOtimizacao = useRef(0);

  useEffect(() => {
    fetch('/api/openrouter-status')
      .then(r => r.json())
      .then(data => setStatusOpenRouter(data))
      .catch(err => console.warn('Status OpenRouter não disponível:', err));
  }, []);

  const sincronizarFila = () => {
    setChamadosFila(filaEngine.listarFila());
    setMensageriaLog(filaEngine.getHistoricoMensageria());
  };

  const aplicarEstado = (estado) => {
    setCliente(estado.cliente);
    setVendedorAtivo(estado.vendedorAtivo);
    setItensRota(estado.itensRota);
    setKitAtivo(estado.kitAtivo);
    setLocalizacao(estado.localizacao);
    setDadosOtimizacaoIA(estado.dadosOtimizacaoIA ?? null);
    filaEngine.restaurar(estado.chamadosFila, estado.mensageriaLog);
    sincronizarFila();
  };

  // Guarda cada alteração no navegador
  useEffect(() => {
    salvarEstado({ cliente, vendedorAtivo, itensRota, chamadosFila, mensageriaLog, kitAtivo, localizacao, dadosOtimizacaoIA });
  }, [cliente, vendedorAtivo, itensRota, chamadosFila, mensageriaLog, kitAtivo, localizacao, dadosOtimizacaoIA]);

  // Mantém alinhadas as abas do mesmo navegador 
  useEffect(() => assinarMudancas(aplicarEstado), []);

  // A lista ou a ordem mudou: o resultado anterior não descreve mais a rota,
  // e uma resposta ainda a caminho também perde a validade
  const descartarOtimizacao = () => {
    pedidoOtimizacao.current += 1;
    setDadosOtimizacaoIA(null);
    setErroOtimizacaoIA(null);
  };

  const registrarLocalizacao = (corredor) => {
    descartarOtimizacao();
    setLocalizacao({ corredor, lidoEm: new Date().toISOString() });
    setItensRota(itens => ordenarRota(itens, corredor));
    setQrInvalido(null);
    setVisaoAtiva('CLIENTE');
  };

  const handleLimparLocalizacao = () => {
    descartarOtimizacao();
    setLocalizacao(null);
    setItensRota(itens => ordenarRota(itens));
  };

  // QR code
  useEffect(() => {
    const leitura = lerCorredorDaUrl();
    if (!leitura) return;
    limparCorredorDaUrl();
    if (leitura.corredor) {
      registrarLocalizacao(leitura.corredor);
    } else {
      setQrInvalido(leitura.invalido);
    }
  }, []);

  
  const cancelarChamadosDosItens = (itens) => {
    const fila = filaEngine.listarFila();
    itens.forEach(item => {
      const chamado = fila.find(c => c.id === item.chamadoId);
      if (chamado && chamadoEstaAberto(chamado)) {
        filaEngine.atualizarStatus(chamado.id, 'CANCELADO_PELO_CLIENTE');
      }
    });
    sincronizarFila();
  };

  // 1. AÇÃO: Adicionar item à Lista de Compras
  const handleAdicionarItem = (produto) => {
    descartarOtimizacao();
    setItensRota(itensAtuais => {
      const novoItem = {
        id: `item-${Date.now()}`,
        produto,
        quantidade: 1,
        coletado: false
      };
      return ordenarRota([...itensAtuais, novoItem], localizacao?.corredor);
    });
  };

  // 2. AÇÃO: Remover item da Lista
  const handleRemoverItem = (itemId) => {
    descartarOtimizacao();
    cancelarChamadosDosItens(itensRota.filter(i => i.id === itemId));
    setItensRota(itens => itens.filter(i => i.id !== itemId));
  };

  // 3. AÇÃO: Marcar item como Coletado / Carrinho
  const handleToggleColetado = (itemId) => {
    setItensRota(itens =>
      itens.map(i => i.id === itemId ? { ...i, coletado: !i.coletado } : i)
    );
  };

  // 4. AÇÃO CRÍTICA: Botão "Não Achei"
  const handleDispararNaoAchei = (item, observacao) => {
    // Cria novo DTO de chamado
    const novoChamado = criarChamadoRuptura(cliente, item.produto, observacao);

    // Matchmaking automático com o vendedor mais próximo do setor
    const vendedorSugerido = filaEngine.encontrarVendedorMaisApropriado(item.produto, VENDEDORES_DISPONIVEIS);
    novoChamado.vendedorId = vendedorSugerido.id;
    novoChamado.vendedorNome = vendedorSugerido.nome;
    novoChamado.corredorCliente = localizacao?.corredor ?? null;

    filaEngine.enfileirar(novoChamado);
    sincronizarFila();

    // A visão do vendedor abre em quem recebeu o chamado
    setVendedorAtivo(vendedorSugerido);

    // Atualiza status do item na rota do cliente
    setItensRota(itens =>
      itens.map(i => i.id === item.id ? {
        ...i,
        statusRuptura: 'AGUARDANDO_FILA',
        chamadoId: novoChamado.id,
        observacao
      } : i)
    );
  };

  // 5. AÇÃO: Atualizar status do chamado pelo vendedor
  const handleAtualizarStatusChamado = (chamadoId, novoStatus) => {
    const chamadoAtualizado = filaEngine.atualizarStatus(chamadoId, novoStatus, vendedorAtivo);
    sincronizarFila();

    // Se o chamado foi resolvido (estoque achado ou estoque vazio reportado no ERP)
    if (chamadoAtualizado) {
      setItensRota(itens =>
        itens.map(i => {
          if (i.chamadoId === chamadoId) {
            return {
              ...i,
              statusRuptura: novoStatus,
              coletado: novoStatus === 'CONCLUIDO_ESTOQUE_LOCALIZADO'
            };
          }
          return i;
        })
      );
    }
  };

  // 6. AÇÃO: Vendedor oferece um substituto ao cliente
  const handleOferecerSubstituto = (chamadoId, substituto) => {
    filaEngine.oferecerSubstituto(chamadoId, substituto);
    sincronizarFila();
  };

  // 7. AÇÃO: Cliente aceita ou recusa o substituto oferecido
  const handleResponderSubstituto = (chamadoId, aceito) => {
    if (!aceito) {
      filaEngine.recusarSubstituto(chamadoId);
      sincronizarFila();
      return;
    }

    const chamado = filaEngine.atualizarStatus(chamadoId, 'CONCLUIDO_COM_SUBSTITUTO');
    sincronizarFila();
    if (!chamado) return;

    descartarOtimizacao();
    const substituto = chamado.produtoSubstitutoSugerido;
    setItensRota(itens => {
      const original = itens.find(i => i.chamadoId === chamadoId);
      if (!original) return itens;

      const restantes = itens.filter(i => i.id !== original.id);
      const jaNaLista = restantes.some(i => i.produto.id === substituto.id);
      const atualizados = jaNaLista
        ? restantes.map(i => i.produto.id === substituto.id
            ? { ...i, quantidade: i.quantidade + original.quantidade }
            : i)
        : [...restantes, {
            id: `item-${Date.now()}`,
            produto: substituto,
            quantidade: original.quantidade,
            coletado: false,
            substituiuProduto: original.produto.nome
          }];

      return ordenarRota(atualizados, localizacao?.corredor);
    });
  };

  // 8. AÇÃO: Desenfileirar primeiro chamado da fila
  const handleDesenfileirarPrimeiro = () => {
    filaEngine.desenfileirar();
    sincronizarFila();
  };

  // 9. AÇÃO: Carregar lista pré-definida de exemplo
  const handleCarregarListaPredefinida = (kit) => {
    descartarOtimizacao();
    cancelarChamadosDosItens(itensRota);
    setItensRota(ordenarRota(criarItensDaLista(kit.produtosSkus), localizacao?.corredor));
    setCliente(c => ({ ...c, perfilProjeto: kit.perfil }));
    setKitAtivo(kit.nome);
  };

  const handleMudarPerfilProjeto = (perfil) => {
    setCliente(c => ({ ...c, perfilProjeto: perfil }));
  };

  // 10. AÇÃO: Otimizar a rota (com IA se o servidor tiver a chave, senão por regras)
  const handleOtimizarRotaComIA = async () => {
    const pedido = ++pedidoOtimizacao.current;
    setOtimizandoIA(true);
    setErroOtimizacaoIA(null);
    try {
      const res = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: itensRota,
          localizacao,
          perfilProjeto: cliente.perfilProjeto
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.itensOrdenados)) {
        throw new Error(data.error || `Resposta inesperada do servidor (${res.status})`);
      }
      if (pedido !== pedidoOtimizacao.current) return;

      // Aplica só a ordem: o que o cliente marcou durante a espera continua valendo
      setItensRota(itensAtuais => {
        const itemPorId = new Map(itensAtuais.map(i => [i.id, i]));
        const ordenados = data.itensOrdenados.map(i => itemPorId.get(i.id)).filter(Boolean);
        const idsOrdenados = new Set(ordenados.map(i => i.id));
        return [...ordenados, ...itensAtuais.filter(i => !idsOrdenados.has(i.id))];
      });
      setDadosOtimizacaoIA({
        source: data.source,
        model: data.model,
        resumoEstrategia: data.resumoEstrategia,
        dicas: data.dicas,
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error('Falha ao otimizar rota:', err);
      if (pedido === pedidoOtimizacao.current) {
        setErroOtimizacaoIA('Não foi possível otimizar a rota agora. Sua lista continua na ordem atual.');
      }
    } finally {
      setOtimizandoIA(false);
    }
  };

  const handleRestaurarOrdemLinear = () => {
    descartarOtimizacao();
    setItensRota(itens => ordenarRota(itens, localizacao?.corredor));
  };

  // Volta a demonstração para o início, inclusive nas outras abas
  const handleReiniciarDemonstracao = () => {
    descartarOtimizacao();
    aplicarEstado(criarEstadoInicial());
    setQrInvalido(null);
    setVisaoAtiva('CLIENTE');
  };

  // Apenas chamados ativos que estão realmente aguardando ou em atendimento pelo vendedor
  const totalFila = chamadosFila.filter(chamadoEstaAberto).length;

  return (
    <div className="min-h-screen bg-[#F4F4F4] print:bg-white text-slate-800 flex flex-col">
      {/* Top Bar  */}
      <Header
        visaoAtiva={visaoAtiva}
        onMudarVisao={setVisaoAtiva}
        totalFila={totalFila}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 print:p-0">
        {/* Visão do Cliente  */}
        {visaoAtiva === 'CLIENTE' && (
          <ClientMissionView
            itensRota={itensRota}
            chamadosAtivos={chamadosFila}
            cliente={cliente}
            kitAtivo={kitAtivo}
            localizacao={localizacao}
            qrInvalido={qrInvalido}
            dadosOtimizacaoIA={dadosOtimizacaoIA}
            otimizandoIA={otimizandoIA}
            erroOtimizacaoIA={erroOtimizacaoIA}
            statusOpenRouter={statusOpenRouter}
            onOtimizarRotaComIA={handleOtimizarRotaComIA}
            onRestaurarOrdemLinear={handleRestaurarOrdemLinear}
            onAdicionarItem={handleAdicionarItem}
            onRemoverItem={handleRemoverItem}
            onToggleColetado={handleToggleColetado}
            onDispararNaoAchei={handleDispararNaoAchei}
            onResponderSubstituto={handleResponderSubstituto}
            onCarregarListaPredefinida={handleCarregarListaPredefinida}
            onMudarPerfilProjeto={handleMudarPerfilProjeto}
            onLimparLocalizacao={handleLimparLocalizacao}
            onFecharQrInvalido={() => setQrInvalido(null)}
          />
        )}

        {/* Visão do Vendedor */}
        {visaoAtiva === 'VENDEDOR' && (
          <SellerConsultantView
            chamadosFila={chamadosFila}
            vendedorAtivo={vendedorAtivo}
            mensageriaLog={mensageriaLog}
            onTrocarVendedor={setVendedorAtivo}
            onAtualizarStatusChamado={handleAtualizarStatusChamado}
            onOferecerSubstituto={handleOferecerSubstituto}
            onDesenfileirarPrimeiro={handleDesenfileirarPrimeiro}
          />
        )}

        {/* Placas QR dos corredores */}
        {visaoAtiva === 'PLACAS' && (
          <QrPlacasView onSimularLeitura={registrarLocalizacao} />
        )}
      </main>

      {/* Rodapé */}
      <footer className="flex justify-center border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <span>
            Leroy Co-Piloto © 2026
          </span>
          <button
            onClick={handleReiniciarDemonstracao}
            className="font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 px-2 py-1"
          >
            Reiniciar demonstração
          </button>
        </div>
      </footer>
    </div>
  );
}
