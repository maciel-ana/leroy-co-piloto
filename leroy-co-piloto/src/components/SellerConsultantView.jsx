/**
 * @license
 * Tela 2: Visão do Vendedor - Modo Consultor
 */

import React, { useState } from 'react';
import { VENDEDORES_DISPONIVEIS, PRODUTOS_CATALOGO } from '../data/mockStoreData.js';
import { chamadoEstaAberto } from '../services/queueEngine.js';
import { formatarNumero, formatarPreco } from '../services/formatacao.js';
import { 
  Clock, 
  CheckCircle2, 
  Layers, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  PackageCheck,
  UserCheck,
  Navigation2,
  Check,
  Archive
} from 'lucide-react';

export const SellerConsultantView = ({
  chamadosFila = [],
  vendedorAtivo = VENDEDORES_DISPONIVEIS[0],
  mensageriaLog = [],
  onTrocarVendedor,
  onAtualizarStatusChamado,
  onOferecerSubstituto,
  onDesenfileirarPrimeiro
}) => {
  const [chamadoParaReportarVazio, setChamadoParaReportarVazio] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [abaFila, setAbaFila] = useState('PENDENTES');

  // Cada consultor enxerga só os chamados direcionados a ele
  const chamadosDoVendedor = chamadosFila.filter(c => c.vendedorId === vendedorAtivo.id);

  // Filtrar apenas chamados pendentes (que ainda requerem ação do vendedor)
  const chamadosPendentes = chamadosDoVendedor.filter(chamadoEstaAberto);

  // Chamados já finalizados ou reportados como Estoque Vazio no ERP
  const chamadosReportados = chamadosDoVendedor.filter(
    c => c.status === 'ESTOQUE_VAZIO_REPORTADO' ||
         c.status === 'RUPTURA_CONFIRMADA' ||
         c.status === 'CONCLUIDO_COM_SUBSTITUTO' ||
         c.status === 'CONCLUIDO_ESTOQUE_LOCALIZADO'
  );

  const contarAbertosDe = (vendedorId) =>
    chamadosFila.filter(c => c.vendedorId === vendedorId && chamadoEstaAberto(c)).length;
  const abertosComOutros = chamadosFila.filter(chamadoEstaAberto).length - chamadosPendentes.length;

  const handleConfirmarEstoqueVazio = () => {
    if (!chamadoParaReportarVazio) return;
    
    // Atualiza status para ESTOQUE_VAZIO_REPORTADO
    onAtualizarStatusChamado(chamadoParaReportarVazio.id, 'ESTOQUE_VAZIO_REPORTADO');
    
    const prodNome = chamadoParaReportarVazio.produto.nome;
    const corredor = chamadoParaReportarVazio.corredor;
    
    setChamadoParaReportarVazio(null);
    setMensagemSucesso(`Estoque vazio de "${prodNome}" reportado no ERP com sucesso! Reposição acionada para o Corredor ${corredor}. Chamado concluído e retirado da fila.`);
    
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 5000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alerta de Sucesso ao Reportar Estoque Vazio */}
      {mensagemSucesso && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-emerald-900">
              Estoque Vazio Registrado no ERP!
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              {mensagemSucesso}
            </p>
          </div>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de Perfil do Vendedor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#008542] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-xs shrink-0">
              {vendedorAtivo.nome.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#008542] uppercase tracking-wider">
                  Modo Consultor
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">Matrícula: {vendedorAtivo.matricula}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {vendedorAtivo.nome}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Setor: {(vendedorAtivo.setorResponsavel || '').replace(/_/g, ' ')} · Corredor {vendedorAtivo.corredorAtual}
              </p>
            </div>
          </div>

          {/* Troca de Vendedor */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Trocar Consultor:</span>
            <div className="flex flex-wrap gap-1.5">
              {VENDEDORES_DISPONIVEIS.map(v => {
                const abertos = contarAbertosDe(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => onTrocarVendedor(v)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      vendedorAtivo.id === v.id
                        ? 'bg-[#008542] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v.nome.split(' ')[0]} ({v.setorResponsavel.split('_')[0]})
                    {abertos > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {abertos}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Métricas do Vendedor */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Chamados na Fila</span>
            <span className="text-lg sm:text-xl font-bold text-[#008542] tabular-nums">
              {chamadosPendentes.length}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Atendimentos Hoje</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
              {vendedorAtivo.chamadosAtendidosHoje + chamadosReportados.length}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 block">Tempo Médio</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
              {formatarNumero(vendedorAtivo.tempoMedioAtendimentoMin)} min
            </span>
          </div>
        </div>
      </div>

      {/* PAINEL DA FILA DE CHAMADOS COM CONTROLE DE ABAS (Pendentes vs Reportados) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#008542]" />
              Painel de Ruptura & Atendimento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chamados gerados pelo botão &quot;Não Achei&quot; do cliente na loja física
            </p>
          </div>

          {/* Abas: Chamados Ativos na Fila vs Histórico Reportado */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setAbaFila('PENDENTES')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                abaFila === 'PENDENTES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Fila Pendente ({chamadosPendentes.length})
            </button>
            <button
              onClick={() => setAbaFila('REPORTADOS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                abaFila === 'REPORTADOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Reportados / Concluídos ({chamadosReportados.length})
            </button>
          </div>
        </div>

        {/* ABA 1: CHAMADOS PENDENTES NA FILA */}
        {abaFila === 'PENDENTES' && (
          <div>
            {chamadosPendentes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Fila Vazia! Nenhum chamado pendente no momento.
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {abertosComOutros > 0
                    ? `${abertosComOutros} ${abertosComOutros === 1 ? 'chamado aberto está' : 'chamados abertos estão'} com outros consultores. Troque de consultor acima para ver.`
                    : 'Todos os chamados foram atendidos ou reportados no ERP.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chamadosPendentes.map((chamado, idx) => {
                  const ehPrimeiroDaFila = idx === 0;
                  const substitutesDisponiveis = PRODUTOS_CATALOGO.filter(
                    p => chamado.produto.substitutosSugeridosSkus.includes(p.sku) && p.estoqueDisponivel > 0
                  );

                  return (
                    <div
                      key={chamado.id}
                      className={`rounded-xl border transition-all p-3.5 sm:p-4 ${
                        ehPrimeiroDaFila
                          ? 'border-[#008542] bg-[#EBF7F0]/30 shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {chamado.cliente.nome}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs font-semibold text-[#008542]">
                                Corredor {chamado.corredor}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-500">
                                {chamado.moduloGondola}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                              {chamado.produto.nome}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600">
                              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                Contexto: {(chamado.cliente.perfilProjeto || '').replace(/_/g, ' ')}
                              </span>
                              {chamado.corredorCliente && (
                                <span className="font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-indigo-800">
                                  Cliente no Corredor {chamado.corredorCliente} (QR)
                                </span>
                              )}
                              {chamado.observacaoCliente && (
                                <span className="italic text-slate-500">
                                  &quot;{chamado.observacaoCliente}&quot;
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                            chamado.status === 'AGUARDANDO_FILA'
                              ? 'bg-amber-100 text-amber-800'
                              : chamado.status === 'EM_DESLOCAMENTO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {chamado.status === 'AGUARDANDO_FILA' && '⏳ Aguardando'}
                            {chamado.status === 'EM_DESLOCAMENTO' && '🏃 A Caminho'}
                            {chamado.status === 'EM_ATENDIMENTO' && '🤝 Em Atendimento'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Aberto às {new Date(chamado.dataHoraAbertura).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* ÁREA CONSULTIVA: Sugestões de Substituição */}
                      <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#008542]" />
                            Substitutos Disponíveis em Estoque (Abordagem Consultiva):
                          </span>
                        </div>

                        {substitutesDisponiveis.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            {chamado.produtoSubstitutoSugerido
                              ? `Aguardando o cliente responder sobre: ${chamado.produtoSubstitutoSugerido.nome}.`
                              : chamado.status === 'EM_ATENDIMENTO'
                              ? 'Ofereça um substituto: o cliente aceita ou recusa no celular.'
                              : 'Você poderá oferecer um substituto ao iniciar o atendimento.'}
                          </p>
                        )}

                        {substitutesDisponiveis.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {substitutesDisponiveis.map(sub => (
                              <div
                                key={sub.id}
                                className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between gap-2"
                              >
                                <div>
                                  <span className="text-xs font-semibold text-slate-900 block">
                                    {sub.nome}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {sub.marca} · Corredor {sub.corredor}
                                  </span>
                                  <div className="text-[11px] font-bold text-[#008542] mt-0.5">
                                    {formatarPreco(sub.preco)} · {sub.estoqueDisponivel} un. disponíveis
                                  </div>
                                </div>
                                <button
                                  onClick={() => onOferecerSubstituto(chamado.id, sub)}
                                  disabled={chamado.status !== 'EM_ATENDIMENTO' || !!chamado.produtoSubstitutoSugerido}
                                  className="px-3 py-1.5 min-h-[36px] text-xs font-semibold bg-[#008542] text-white rounded-lg hover:bg-[#006834] transition-colors shrink-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                  {chamado.produtoSubstitutoSugerido?.id === sub.id ? 'Oferecido' : 'Oferecer'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Nenhum substituto direto cadastrado com estoque no momento.
                          </p>
                        )}

                        {/* BOTÕES DE FLUXO DO VENDEDOR */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 pt-2">
                          {chamado.status === 'AGUARDANDO_FILA' && (
                            <button
                              onClick={() => onAtualizarStatusChamado(chamado.id, 'EM_DESLOCAMENTO')}
                              className="px-4 py-2.5 min-h-[44px] text-xs font-bold bg-[#008542] text-white rounded-xl hover:bg-[#006834] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Navigation2 className="w-4 h-4" />
                              Aceitar Chamado & Ir ao Corredor {chamado.corredor}
                            </button>
                          )}

                          {chamado.status === 'EM_DESLOCAMENTO' && (
                            <button
                              onClick={() => onAtualizarStatusChamado(chamado.id, 'EM_ATENDIMENTO')}
                              className="px-4 py-2.5 min-h-[44px] text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <UserCheck className="w-4 h-4" />
                              Cheguei no Corredor (Iniciar Atendimento)
                            </button>
                          )}

                          {chamado.status === 'EM_ATENDIMENTO' && (
                            <button
                              onClick={() => onAtualizarStatusChamado(chamado.id, 'CONCLUIDO_ESTOQUE_LOCALIZADO')}
                              className="px-3.5 py-2.5 min-h-[44px] text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <PackageCheck className="w-4 h-4" />
                              Achei Estoque no Mezanino
                            </button>
                          )}

                          {/* BOTÃO PRINCIPAL DE REPORTAR ESTOQUE VAZIO NO ERP */}
                          <button
                            onClick={() => setChamadoParaReportarVazio(chamado)}
                            className="px-3.5 py-2.5 min-h-[44px] text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Reportar Estoque Vazio (ERP / Reposição)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: CHAMADOS JÁ REPORTADOS / CONCLUÍDOS */}
        {abaFila === 'REPORTADOS' && (
          <div className="space-y-3">
            {chamadosReportados.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                Nenhum chamado foi finalizado ou reportado como estoque vazio ainda.
              </div>
            ) : (
              chamadosReportados.map(chamado => (
                <div
                  key={chamado.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {chamado.produto.nome}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        Corredor {chamado.corredor} ({chamado.moduloGondola})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Cliente: {chamado.cliente.nome} ({(chamado.cliente.perfilProjeto || '').replace(/_/g, ' ')})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {chamado.status === 'ESTOQUE_VAZIO_REPORTADO' && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Estoque Vazio Reportado no ERP
                      </span>
                    )}
                    {chamado.status === 'CONCLUIDO_COM_SUBSTITUTO' && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Substituto Aceito: {chamado.produtoSubstitutoSugerido?.nome}
                      </span>
                    )}
                    {chamado.status === 'CONCLUIDO_ESTOQUE_LOCALIZADO' && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Localizado no Mezanino
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO: REPORTAR ESTOQUE VAZIO NO ERP */}
      {chamadoParaReportarVazio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Confirmar Reporte de Estoque Vazio no ERP?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Esta ação registrará no ERP central que a gôndola física está com <strong>saldo 0 (ruptura real)</strong>, disparando a ordem de reposição do centro de distribuição e removendo o chamado da fila de atendimento do vendedor.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">Produto:</span>{' '}
                <strong className="text-slate-900">{chamadoParaReportarVazio.produto.nome}</strong>
              </div>
              <div>
                <span className="text-slate-500">SKU Leroy:</span>{' '}
                <span className="font-mono text-slate-800">{chamadoParaReportarVazio.produto.sku}</span>
              </div>
              <div>
                <span className="text-slate-500">Localização Física:</span>{' '}
                <span className="font-semibold text-[#008542]">
                  Corredor {chamadoParaReportarVazio.corredor} · {chamadoParaReportarVazio.moduloGondola}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Cliente Notificado:</span>{' '}
                <span className="text-slate-800">{chamadoParaReportarVazio.cliente.nome}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setChamadoParaReportarVazio(null)}
                className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEstoqueVazio}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirmar Estoque Vazio & Baixar da Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
