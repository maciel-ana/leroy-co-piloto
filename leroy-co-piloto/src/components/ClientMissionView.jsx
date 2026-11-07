/**
 * @license
 * Tela 1: Visão do Cliente ("Modo Missão") 
 */

import { useState } from 'react';
import { PRODUTOS_CATALOGO, LISTAS_PREDEFINIDAS } from '../data/mockStoreData.js';
import { calcularEstatisticasRota } from '../services/routeEngine.js';
import { classificarCarga } from '../services/cargaProduto.js';
import { formatarPreco, normalizarTexto } from '../services/formatacao.js';
import { StoreMapVisualizer } from './StoreMapVisualizer.jsx';
import { 
  Check, 
  Search, 
  AlertTriangle, 
  Navigation, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Footprints,
  Compass,
  ShieldAlert,
  QrCode,
  PackageCheck,
  Replace,
  RotateCcw
} from 'lucide-react';

export const ClientMissionView = ({
  itensRota = [],
  chamadosAtivos = [],
  cliente = {},
  kitAtivo,
  localizacao = null,
  qrInvalido = null,
  dadosOtimizacaoIA = null,
  otimizandoIA = false,
  erroOtimizacaoIA = null,
  statusOpenRouter = null,
  onOtimizarRotaComIA,
  onRestaurarOrdemLinear,
  onAdicionarItem,
  onRemoverItem,
  onToggleColetado,
  onDispararNaoAchei,
  onResponderSubstituto,
  onCarregarListaPredefinida,
  onMudarPerfilProjeto,
  onLimparLocalizacao,
  onFecharQrInvalido
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarDropdownBusca, setMostrarDropdownBusca] = useState(false);
  const [itemSelecionadoNaoAchei, setItemSelecionadoNaoAchei] = useState(null);
  const [observacaoRuptura, setObservacaoRuptura] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const iaConfigurada = statusOpenRouter?.configured === true;

  const obterTagErgonomia = (produto) => {
    const carga = classificarCarga(produto);
    if (carga === 'PESADA') {
      return { texto: 'Base do Carrinho (Pesado)', cor: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (carga === 'MEDIA') {
      return { texto: 'Carga Média / Tubos', cor: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
    if (produto.categoria === 'FERRAMENTAS') {
      return { texto: 'Ferramenta / Compacto', cor: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
    return { texto: 'Topo do Carrinho (Leve)', cor: 'bg-purple-100 text-purple-900 border-purple-300' };
  };

  const estatisticas = calcularEstatisticasRota(itensRota);

  // Produtos filtrados para busca: ignora acentos e aceita várias palavras
  const palavrasBusca = normalizarTexto(termoBusca).split(/\s+/).filter(Boolean);
  const produtosFiltrados = palavrasBusca.length === 0
    ? PRODUTOS_CATALOGO.slice(0, 5)
    : PRODUTOS_CATALOGO.filter(p => {
        const textoProduto = normalizarTexto(
          [p.nome, p.sku, p.corredor, p.categoria, p.marca, p.especificacaoTecnica].join(' ')
        );
        return palavrasBusca.every(palavra => textoProduto.includes(palavra));
      });

  const handleConfirmarNaoAchei = () => {
    if (!itemSelecionadoNaoAchei) return;
    onDispararNaoAchei(itemSelecionadoNaoAchei, observacaoRuptura);
    setItemSelecionadoNaoAchei(null);
    setObservacaoRuptura('');
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6">
      {/* Banner Superior do Modo Missão */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] flex items-center justify-center text-[#008542] shrink-0 font-bold">
              <Compass className="w-5 h-5 text-[#008542]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] font-bold text-leroy-dark bg-grey p-1.5 rounded-xl tracking-wider uppercase">Modo Missão</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">Loja Marginal Tietê (SP)</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                Olá, {cliente.nome}
              </h1>
              <p className="hidden sm:block text-xs text-slate-600">
                {dadosOtimizacaoIA
                  ? 'Sua lista está na ordem otimizada.'
                  : localizacao
                  ? `Sua lista parte do Corredor ${localizacao.corredor}, sempre para o item mais próximo.`
                  : 'Sua lista está alinhada à ordem física dos corredores da loja.'}
              </p>
            </div>
          </div>

          {/* Seletor de Perfil do Projeto */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <label className="text-[11px] font-bold text-grey2 tracking-wide">
              CONTEXTO DO PROJETO:
            </label>
            <select
              value={cliente.perfilProjeto || 'REFORMA_BANHEIRO'}
              onChange={(e) => onMudarPerfilProjeto(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#008542]"
            >
              <option value="REFORMA_BANHEIRO">Reforma de Banheiro</option>
              <option value="PINTURA_COMPLETA">Pintura Completa</option>
              <option value="INSTALACAO_ELETRICA">Instalação Elétrica</option>
              <option value="BRICOLAGEM_REPARO">Bricolagem & Reparos</option>
              <option value="OBRA_ESTRUTURAL">Obra Estrutural</option>
            </select>
          </div>
        </div>

        {/* Métricas do Percurso Otimizado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-slate-100 text-center">
          <div className="bg-white-leroy p-2 sm:p-3 rounded-xl border border-grey">
            <div className="flex justify-between items-center sm:pb-3">
              <span className="text-[11px] text-slate-500 block">Itens na Missão</span>
              <span className="material-symbols-outlined text-grey2 !text-[15px]">list_alt_check</span>
            </div>
            <span className="block text-left text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {estatisticas.itensColetados} / {estatisticas.totalItens}
            </span>
          </div>

          <div className="bg-slate-50 p-2 sm:p-3 rounded-xl border border-grey">
            <div className="flex justify-between items-center sm:pb-3">
              <span className="text-[11px] text-slate-500 block">Distância Estimada</span>
              <span className="material-symbols-outlined text-grey2 !text-[15px]">trending_up</span>
            </div>
            <span className="block text-left text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              ~{estatisticas.distanciaEstimadaMetros}m
            </span>
          </div>

          <div className="bg-slate-50 p-2 sm:p-3 rounded-xl border border-grey">
            <div className="flex justify-between items-center sm:pb-3">
              <span className="text-[11px] text-slate-500 block">Tempo Estimado</span>
              <span className="material-symbols-outlined text-grey2 !text-[15px]">schedule</span>
            </div>
            <span className="block text-left text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              ~{estatisticas.tempoEstimadoMinutos} min
            </span>
          </div>

          <div className="bg-[#EBF7F0] p-2 sm:p-3 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-leroy-dark font-bold block text-left">TEMPO ECONOMIZADO</span>
              <span className="material-symbols-outlined text-leroy-darker !text-[15px] bg-assistente p-1 sm:p-1.5 rounded-xl">electric_bolt</span>
            </div>
            <span className="block text-left text-base sm:text-xl font-extrabold text-[#008542] tabular-nums">
              -{estatisticas.tempoEconomizadoMinutos} min
            </span>
          </div>
        </div>
      </div>

      {/* Posição do cliente, informada pelo QR da placa do corredor */}
      {localizacao && (
        <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <QrCode className="w-5 h-5 text-indigo-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-900">
              Você está no Corredor {localizacao.corredor}
            </p>
            <p className="text-[11px] text-indigo-700">
              Rota recalculada a partir daqui · Leitura às {new Date(localizacao.lidoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onLimparLocalizacao}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 px-2 py-1 min-h-[36px] shrink-0"
          >
            Limpar
          </button>
        </div>
      )}

      {/* QR que não corresponde a nenhum corredor da loja */}
      {qrInvalido !== null && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="flex-1 min-w-0 text-xs text-rose-800 break-words">
            Este QR code não corresponde a um corredor da loja{qrInvalido ? ` ("${qrInvalido}")` : ''}. Tente ler a placa novamente.
          </p>
          <button
            onClick={onFecharQrInvalido}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 px-2 py-1 min-h-[36px] shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Barra de Ação Rápida: no celular fica após a lista, que é o foco de quem está na loja */}
      <div className="order-last sm:order-none flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200">
      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0">
        Listas Rápidas de Teste:
      </span>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {LISTAS_PREDEFINIDAS.map((kit) => {
            const estaAtivo = kitAtivo === kit.nome;

            return (
              <button
                key={kit.nome}
                onClick={() => onCarregarListaPredefinida(kit)}
                className={`flex items-center gap-2 text-xs font-medium px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg border transition-colors ${
                  estaAtivo
                    ? 'bg-emerald-50 border-assistente text-leroy-dark'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-assistente hover:text-leroy-dark'
                }`}
              >
                {kit.nome}
                
                {estaAtivo && (
                  <span className="w-2 h-2 rounded-full bg-leroy-dark shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adicionar Produto à Lista (com Autocomplete) */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 shadow-xs min-h-[48px]">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => {
              setTermoBusca(e.target.value);
              setMostrarDropdownBusca(true);
            }}
            onFocus={() => setMostrarDropdownBusca(true)}
            placeholder="Buscar produto (ex: Argamassa, Tubo PVC, Disjuntor, Tinta)..."
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none py-1"
          />
          {termoBusca && (
            <button
              onClick={() => {
                setTermoBusca('');
                setMostrarDropdownBusca(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Dropdown de Sugestões do Catálogo */}
        {mostrarDropdownBusca && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 sm:max-h-72 overflow-y-auto">
            <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Catálogo da Loja</span>
              <button 
                onClick={() => setMostrarDropdownBusca(false)}
                className="text-slate-500 hover:text-slate-700 font-semibold p-1"
              >
                Fechar ✕
              </button>
            </div>
            {produtosFiltrados.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Nenhum produto encontrado para &quot;{termoBusca}&quot;.
              </div>
            ) : (
              produtosFiltrados.map((prod) => {
                const jaNaLista = itensRota.some(i => i.produto.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    className="p-3 hover:bg-slate-50 border-b border-slate-50 flex items-center justify-between gap-2.5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#008542]">{prod.corredor}</span>
                        <span className="text-xs font-medium text-slate-800">{prod.nome}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {prod.marca} · {prod.moduloGondola} · {formatarPreco(prod.preco)}
                        {prod.estoqueDisponivel === 0 && (
                          <span className="text-rose-600 font-semibold ml-2">● Ruptura Prevista</span>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={jaNaLista}
                      onClick={() => {
                        onAdicionarItem(prod);
                        setTermoBusca('');
                        setMostrarDropdownBusca(false);
                      }}
                      className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors shrink-0 ${
                        jaNaLista
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#008542] text-white hover:bg-[#006834]'
                      }`}
                    >
                      {jaNaLista ? 'Na Lista' : 'Adicionar'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Painel de Otimização OpenRouter AI */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008542] to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {dadosOtimizacaoIA && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    ✓ Rota Otimizada
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-leroy-darker mt-1">
                Otimização Inteligente de Percurso & Carrinho
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mt-0.5">
                {iaConfigurada
                  ? `Usa IA (${statusOpenRouter.model}) para ordenar produtos pelo menor esforço físico, reduzindo passos e posicionando cargas pesadas na base do carrinho.`
                  : 'Reorganiza a lista por regras de distância e de peso dos produtos, sem usar IA.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            {dadosOtimizacaoIA && (
              <button
                onClick={onRestaurarOrdemLinear}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5"
                title="Voltar para a ordem física simples dos corredores"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Padrão
              </button>
            )}
            <button
              onClick={onOtimizarRotaComIA}
              disabled={otimizandoIA || itensRota.length === 0}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
                otimizandoIA
                  ? 'bg-emerald-700 cursor-wait opacity-80'
                  : 'bg-[#008542] hover:bg-[#00994C]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${otimizandoIA ? 'animate-spin' : ''}`} />
              {otimizandoIA
                ? (iaConfigurada ? 'Otimizando com IA...' : 'Otimizando...')
                : dadosOtimizacaoIA
                ? 'Re-otimizar Rota'
                : (iaConfigurada ? 'Otimizar Rota com IA' : 'Otimizar Rota')}
            </button>
          </div>
        </div>

        {erroOtimizacaoIA && (
          <div role="alert" className="mt-3.5 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-medium text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{erroOtimizacaoIA}</span>
          </div>
        )}

        {/* Detalhes da estratégia da rota */}
        {dadosOtimizacaoIA && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 md:items-start gap-3">
            <div className="md:col-span-2 bg-[#EBF7F0] border border-[#008542]/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-leroy-darker mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#008542] shrink-0" />
                <span>Estratégia do Trajeto ({dadosOtimizacaoIA.model}):</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">
                {dadosOtimizacaoIA.resumoEstrategia}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-900 block mb-1">
                Dicas de Ergonomia e Paradas:
              </span>
              <ul className="text-[11px] text-slate-700 space-y-1">
                {dadosOtimizacaoIA.dicas?.map((dica, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#008542] font-bold shrink-0">•</span>
                    <span>{dica}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Botão de Alternar Visualização do Mapa */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#008542]" />
          Rota Sequencial por Corredores
        </h2>
        <button
          onClick={() => setMostrarMapa(!mostrarMapa)}
          className="text-xs font-medium text-[#008542] hover:text-[#006834] flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#008542]/20 hover:bg-[#EBF7F0] transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          {mostrarMapa ? 'Ocultar Mapa' : 'Ver Mapa da Loja'}
        </button>
      </div>

      {/* Visualizador de Mapa se ativado */}
      {mostrarMapa && (
        <StoreMapVisualizer
          itensRota={itensRota}
          chamadosAtivos={chamadosAtivos}
          localizacao={localizacao}
          rotaOtimizada={Boolean(dadosOtimizacaoIA)}
        />
      )}

      {/* LISTA DE PRODUTOS */}
      <div className="space-y-3">
        {itensRota.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <Footprints className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">Sua lista de compras está vazia</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Adicione produtos pela busca acima ou clique em uma das listas rápidas para simular o trajeto na loja.
            </p>
          </div>
        ) : (
          itensRota.map((item, index) => {
            const chamadoAtivo = chamadosAtivos.find(c => c.id === item.chamadoId);
            const estaEmAtendimento = !!chamadoAtivo && (
              chamadoAtivo.status === 'AGUARDANDO_FILA' || 
              chamadoAtivo.status === 'EM_DESLOCAMENTO' || 
              chamadoAtivo.status === 'EM_ATENDIMENTO'
            );
            const estoqueVazioConfirmado = item.statusRuptura === 'ESTOQUE_VAZIO_REPORTADO' || chamadoAtivo?.status === 'ESTOQUE_VAZIO_REPORTADO';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all ${
                  item.coletado
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : estoqueVazioConfirmado
                    ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                    : estaEmAtendimento
                    ? 'border-amber-300 shadow-xs'
                    : 'border-slate-200 shadow-xs hover:border-[#008542]/50'
                } p-3.5 sm:p-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Lado Esquerdo*/}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Botão de Check */}
                    <button
                      onClick={() => onToggleColetado(item.id)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.coletado
                          ? 'bg-[#008542] border-[#008542] text-white'
                          : 'border-slate-300 hover:border-[#008542] text-transparent hover:text-slate-300'
                      }`}
                      title={item.coletado ? 'Item coletado' : 'Marcar como coletado'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div>
                      {/* Badge do Corredor e Módulo */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="text-[11px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#008542] text-white">
                          Corredor {item.produto.corredor}
                        </span>
                        <span className="text-xs text-slate-700 font-semibold">
                          {item.produto.moduloGondola}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          {item.produto.prateleira}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${obterTagErgonomia(item.produto).cor}`}>
                          {obterTagErgonomia(item.produto).texto}
                        </span>
                      </div>

                      {/* Nome do Produto */}
                      <h4 className={`text-sm font-semibold ${item.coletado ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {index + 1}. {item.produto.nome}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.produto.especificacaoTecnica}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-semibold text-slate-800">
                          {formatarPreco(item.produto.preco)}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500">
                          Qtd: {item.quantidade} un.
                        </span>
                      </div>

                      {/* O sistema já sabe que falta: avisa antes de o cliente andar até a gôndola */}
                      {item.produto.estoqueDisponivel === 0 && !item.coletado && !estaEmAtendimento && !estoqueVazioConfirmado && (
                        <p className="mt-2 text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-px" />
                          Sem estoque no sistema. Chame um consultor antes de ir até a gôndola.
                        </p>
                      )}

                      {item.substituiuProduto && (
                        <p className="mt-2 text-[11px] font-semibold text-[#006528] flex items-start gap-1.5">
                          <Replace className="w-3.5 h-3.5 shrink-0 mt-px" />
                          Substitui: {item.substituiuProduto}
                        </p>
                      )}

                      {item.statusRuptura === 'CONCLUIDO_ESTOQUE_LOCALIZADO' && (
                        <p className="mt-2 text-[11px] font-semibold text-[#006528] flex items-start gap-1.5">
                          <PackageCheck className="w-3.5 h-3.5 shrink-0 mt-px" />
                          O consultor encontrou este item no estoque para você.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lado Direito: Ações (Botão NÃO ACHEI / Remover) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {!item.coletado && !estaEmAtendimento && !estoqueVazioConfirmado && (
                      <button
                        onClick={() => setItemSelecionadoNaoAchei(item)}
                        className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 active:scale-95 shadow-xs"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Não Achei
                      </button>
                    )}

                    <button
                      onClick={() => onRemoverItem(item.id)}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Remover item da lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Feedback Específico: ESTOQUE VAZIO REPORTADO NO ERP */}
                {estoqueVazioConfirmado && (
                  <div className="mt-3 pt-3 border-t border-rose-200 bg-rose-50/80 -mx-3.5 sm:-mx-4 -mb-3.5 sm:-mb-4 p-3.5 sm:p-4 rounded-b-2xl">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-rose-900 block">
                          Estoque Vazio Confirmado no ERP
                        </span>
                        <p className="text-xs text-rose-700 mt-0.5">
                          O consultor verificou que a gôndola física no Corredor {item.produto.corredor} está sem estoque. Uma ordem de reposição emergencial já foi emitida no sistema central.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner de Chamado Ativo */}
                {estaEmAtendimento && chamadoAtivo && (
                  <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50/70 -mx-3.5 sm:-mx-4 -mb-3.5 sm:-mb-4 p-3.5 sm:p-4 rounded-b-2xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-amber-900">
                          Chamado de Ruptura em Atendimento
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {chamadoAtivo.id}
                        </span>
                      </div>

                      {/* Status do Vendedor */}
                      <div className="mt-2 text-xs text-slate-700 space-y-1">
                        {chamadoAtivo.status === 'AGUARDANDO_FILA' && (
                          <p className="flex items-center gap-1.5 text-amber-800 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Na fila de atendimento. {chamadoAtivo.vendedorNome} já recebeu o seu chamado.
                          </p>
                        )}

                        {chamadoAtivo.status === 'EM_DESLOCAMENTO' && (
                          <p className="flex items-center gap-1.5 text-blue-800 font-medium">
                            <Navigation className="w-3.5 h-3.5 text-blue-600 animate-bounce shrink-0" />
                            Vendedor {chamadoAtivo.vendedorNome} está a caminho do Corredor {chamadoAtivo.corredor}!
                          </p>
                        )}

                        {chamadoAtivo.status === 'EM_ATENDIMENTO' && (
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[#008542] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#008542] shrink-0" />
                              Vendedor {chamadoAtivo.vendedorNome} atendendo você no Corredor {chamadoAtivo.corredor}!
                            </p>
                            {chamadoAtivo.produtoSubstitutoSugerido && (
                              <div className="mt-2 p-2.5 bg-white rounded-lg border border-emerald-200">
                                <span className="text-[11px] font-semibold text-[#008542] block">
                                  💡 Sugestão do Consultor (Substituto Imediato):
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  {chamadoAtivo.produtoSubstitutoSugerido.nome} ({formatarPreco(chamadoAtivo.produtoSubstitutoSugerido.preco)})
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Estoque: {chamadoAtivo.produtoSubstitutoSugerido.estoqueDisponivel} un. disponíveis no Corredor {chamadoAtivo.produtoSubstitutoSugerido.corredor}
                                </span>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => onResponderSubstituto(chamadoAtivo.id, true)}
                                    className="flex-1 sm:flex-none px-3 py-2 min-h-[40px] text-xs font-bold bg-[#008542] text-white rounded-lg hover:bg-[#006834] transition-colors"
                                  >
                                    Aceitar substituto
                                  </button>
                                  <button
                                    onClick={() => onResponderSubstituto(chamadoAtivo.id, false)}
                                    className="flex-1 sm:flex-none px-3 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                  >
                                    Recusar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Disparo "Não Achei" */}
      {itemSelecionadoNaoAchei && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Gôndola Vazia ou Item não Localizado?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Avisaremos imediatamente o vendedor responsável pelo setor para vir até você no corredor e sugerir alternativas.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">Produto:</span>{' '}
                <strong className="text-slate-900">{itemSelecionadoNaoAchei.produto.nome}</strong>
              </div>
              <div>
                <span className="text-slate-500">Localização física:</span>{' '}
                <span className="font-semibold text-[#008542]">
                  Corredor {itemSelecionadoNaoAchei.produto.corredor} · {itemSelecionadoNaoAchei.produto.moduloGondola}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Seu Projeto:</span>{' '}
                <span className="text-slate-800 font-medium">
                  {(itemSelecionadoNaoAchei.cliente?.perfilProjeto || cliente.perfilProjeto || '').replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Observação para o Vendedor (Opcional):
              </label>
              <textarea
                value={observacaoRuptura}
                onChange={(e) => setObservacaoRuptura(e.target.value)}
                placeholder="Ex: Preciso de 2 unidades hoje com urgência, aceito similar de mesma qualidade..."
                rows={2}
                className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008542]"
              />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setItemSelecionadoNaoAchei(null)}
                className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarNaoAchei}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                Chamar Vendedor Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
