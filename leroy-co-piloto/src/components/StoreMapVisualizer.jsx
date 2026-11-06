/**
 * @license
 * Mapa Esquemático Interativo da Loja Física Leroy Merlin
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import { SETORES_MAPA, VENDEDORES_DISPONIVEIS } from '../data/mockStoreData.js';
import { gerarCaminhoRota } from '../services/routeEngine.js';
import { chamadoEstaAberto } from '../services/queueEngine.js';

export const StoreMapVisualizer = ({
  itensRota = [],
  chamadosAtivos = [],
  localizacao = null
}) => {
  const itensPendentes = itensRota.filter(i => !i.coletado);

  // Corredores presentes na rota
  const corredoresNaRota = new Set(itensRota.map(i => i.produto.corredor));

  // Corredores com chamado de atendimento ativo no momento
  const chamadosAbertos = chamadosAtivos.filter(chamadoEstaAberto);
  const corredoresComRuptura = new Set(chamadosAbertos.map(c => c.corredor));

  // Vendedor do chamado mais antigo: já no corredor do cliente, se o atendimento começou
  const chamadoDoVendedor = chamadosAbertos[0];
  const vendedorNoMapa = chamadoDoVendedor && VENDEDORES_DISPONIVEIS.find(v => v.id === chamadoDoVendedor.vendedorId);
  const corredorDoVendedor = chamadoDoVendedor?.status === 'EM_ATENDIMENTO'
    ? chamadoDoVendedor.corredor
    : vendedorNoMapa?.corredorAtual;

  // Trajeto até os itens que ainda faltam, na mesma ordem da lista
  const { caminho, paradas } = gerarCaminhoRota(
    localizacao?.corredor,
    [...new Set(itensPendentes.map(i => i.produto.corredor))]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#008542]" />
            Planta Baixa Esquemática da Loja
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            {localizacao
              ? `Rota calculada a partir do Corredor ${localizacao.corredor}, sempre para o item mais próximo`
              : 'Trajeto linear ordenado por proximidade física dos corredores (A → B → C → D)'}
          </p>
        </div>

        {/* Legenda simples */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#008542]"></span>
            Item na Rota
          </span>
          {chamadosAbertos.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 animate-pulse"></span>
              Aguardando Vendedor
            </span>
          )}
          {vendedorNoMapa && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
              Vendedor
            </span>
          )}
          {localizacao && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-700"></span>
              Você
            </span>
          )}
        </div>
      </div>

      {/* SVG Container Mobile */}
      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox="0 0 580 290"
          className="w-full min-w-[420px] sm:min-w-[500px] h-auto bg-slate-50 rounded-lg border border-slate-200 select-none"
        >
          {/* Fundo de circulação / corredores centrais */}
          <rect x="10" y="10" width="560" height="270" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

          {/* Entrada da Loja */}
          <rect x="230" y="270" width="120" height="15" rx="3" fill="#008542" />
          <text x="290" y="282" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            ENTRADA PRINCIPAL
          </text>

          {/* Áreas dos Setores */}
          {SETORES_MAPA.map(setor => (
            <g key={setor.codigo}>
              {setor.corredores.map(corr => {
                const estaNaRota = corredoresNaRota.has(corr.codigo);
                const temRuptura = corredoresComRuptura.has(corr.codigo);
                const temVendedor = corredorDoVendedor === corr.codigo;
                const clienteAqui = localizacao?.corredor === corr.codigo;
                const itensNesteCorredor = itensRota.filter(i => i.produto.corredor === corr.codigo);
                const todosColetados = itensNesteCorredor.length > 0 && itensNesteCorredor.every(i => i.coletado);

                let preenchimento = '#FFFFFF';
                let borda = '#CBD5E1';
                let strokeW = 1.5;

                if (temRuptura) {
                  preenchimento = '#FFE4E6';
                  borda = '#E11D48';
                  strokeW = 2;
                } else if (estaNaRota) {
                  preenchimento = todosColetados ? '#DCFCE7' : '#E8F5E9';
                  borda = '#008542';
                  strokeW = 2;
                }

                return (
                  <g key={corr.codigo} className="transition-all duration-200">
                    {/* Retângulo do Corredor */}
                    <rect
                      x={corr.x}
                      y={corr.y}
                      width={corr.largura}
                      height={corr.altura}
                      rx="6"
                      fill={preenchimento}
                      stroke={borda}
                      strokeWidth={strokeW}
                    />

                    {/* Código do Corredor */}
                    <text
                      x={corr.x + corr.largura / 2}
                      y={corr.y + 22}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {corr.codigo}
                    </text>

                    {/* Ícone de status dentro do corredor */}
                    {temRuptura && (
                      <g transform={`translate(${corr.x + corr.largura / 2 - 10}, ${corr.y + corr.altura / 2 - 5})`}>
                        <circle cx="10" cy="10" r="10" fill="#E11D48" />
                        <text x="10" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">!</text>
                      </g>
                    )}

                    {!temRuptura && estaNaRota && (
                      <g transform={`translate(${corr.x + corr.largura / 2 - 8}, ${corr.y + corr.altura / 2 - 2})`}>
                        <circle cx="8" cy="8" r="8" fill={todosColetados ? '#16A34A' : '#008542'} />
                        <text x="8" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                          {itensNesteCorredor.length}
                        </text>
                      </g>
                    )}

                    {/* Marcador do Vendedor se estiver neste corredor */}
                    {temVendedor && vendedorNoMapa && (
                      <g transform={`translate(${corr.x + 6}, ${corr.y + corr.altura - 22})`}>
                        <rect x="0" y="0" width="46" height="16" rx="4" fill="#2563EB" />
                        <text x="23" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="600">
                          {vendedorNoMapa.nome.split(' ')[0]}
                        </text>
                      </g>
                    )}

                    {/* Posição do cliente, informada pelo QR da placa */}
                    {clienteAqui && (
                      <g transform={`translate(${corr.x + corr.largura - 30}, ${corr.y + 4})`}>
                        <rect x="0" y="0" width="26" height="14" rx="4" fill="#4338CA" />
                        <text x="13" y="10.5" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
                          Você
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          ))}

          {/* Linha guia de rota entre os corredores que ainda faltam */}
          {caminho && (
            <path
              d={caminho}
              fill="none"
              stroke="#008542"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinejoin="round"
            />
          )}

          {/* Ordem das paradas da rota */}
          {paradas.map((parada, indice) => (
            <g key={parada.codigo} transform={`translate(${parada.x}, ${parada.y})`}>
              <circle r="7" fill="#FFFFFF" stroke="#008542" strokeWidth="1.5" />
              <text y="3" textAnchor="middle" fill="#006528" fontSize="8" fontWeight="700">
                {indice + 1}
              </text>
            </g>
          ))}

          {/* Legenda de Setores */}
          <text x="75" y="40" fill="#64748B" fontSize="9" fontWeight="600">SETOR A: CONSTRUÇÃO</text>
          <text x="330" y="40" fill="#64748B" fontSize="9" fontWeight="600">SETOR B: ELÉTRICA</text>
          <text x="75" y="263" fill="#64748B" fontSize="9" fontWeight="600">SETOR C: TINTAS</text>
          <text x="330" y="263" fill="#64748B" fontSize="9" fontWeight="600">SETOR D: FERRAMENTAS</text>
        </svg>
      </div>
    </div>
  );
};
