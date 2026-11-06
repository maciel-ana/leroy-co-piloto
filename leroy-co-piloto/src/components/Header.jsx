/**
 * @license
 */

import React from 'react';
import { Layers, Smartphone, Briefcase, QrCode } from 'lucide-react';

export const Header = ({
  visaoAtiva,
  onMudarVisao,
  totalFila
}) => {
  return (
    <header className="sticky top-0 z-40 bg-leroy-darker text-white shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Zona 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <svg
            className='w-10 h-10 sm:w-10 sm:h-10 text-leroy-green fill-current shrink-0'
            viewBox='0 0 24 24'
          >
            <polygon points='12,3 22, 20 2, 20' />
          </svg>
          <div className="">
            <h3 className='font-bold'>LEROY CO-PILOTO</h3>
            <p className='text-xs text-assistente font-medium tracking-wide'>ASSISTENTE DE LOJA</p>
          </div>
        </div>

        {/* Zona 2: Alternância de Visões no Desktop/Tablet */}
        <nav className="hidden md:flex items-center gap-1 bg-[#006834] p-1 rounded-xl">
          <button
            onClick={() => onMudarVisao('CLIENTE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              visaoAtiva === 'CLIENTE'
                ? 'bg-white text-[#008542] shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Visão do Cliente
          </button>

          <button
            onClick={() => onMudarVisao('VENDEDOR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap relative ${
              visaoAtiva === 'VENDEDOR'
                ? 'bg-white text-[#008542] shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Visão do Vendedor
            {totalFila > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            onClick={() => onMudarVisao('PLACAS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              visaoAtiva === 'PLACAS'
                ? 'bg-white text-[#008542] shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Placas QR
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#006834] px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-700/40 text-xs">
            <span className="text-emerald-200 text-[10px] sm:text-[11px] hidden sm:inline">Fila:</span>
            <span className="font-bold text-white tabular-nums flex items-center gap-1 text-[11px] sm:text-xs">
              <Layers className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              {totalFila} <span className="hidden sm:inline">{totalFila === 1 ? 'chamado' : 'chamados'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Mobile */}
      <div className="md:hidden flex items-stretch justify-around bg-[#006834] px-1 py-1 border-t border-emerald-700/50 text-[11px] font-semibold">
        <button
          onClick={() => onMudarVisao('CLIENTE')}
          className={`flex-1 py-2 min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors ${
            visaoAtiva === 'CLIENTE' ? 'bg-white text-[#008542] shadow-xs' : 'text-emerald-100'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-0.5" />
          <span>Cliente</span>
        </button>

        <button
          onClick={() => onMudarVisao('VENDEDOR')}
          className={`flex-1 py-2 min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors relative ${
            visaoAtiva === 'VENDEDOR' ? 'bg-white text-[#008542] shadow-xs' : 'text-emerald-100'
          }`}
        >
          <div className="relative">
            <Briefcase className="w-4 h-4 mb-0.5" />
            {totalFila > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </div>
          <span>Vendedor</span>
        </button>

        <button
          onClick={() => onMudarVisao('PLACAS')}
          className={`flex-1 py-2 min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors ${
            visaoAtiva === 'PLACAS' ? 'bg-white text-[#008542] shadow-xs' : 'text-emerald-100'
          }`}
        >
          <QrCode className="w-4 h-4 mb-0.5" />
          <span>Placas QR</span>
        </button>
      </div>
    </header>
  );
};
