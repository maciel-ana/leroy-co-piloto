/**
 * @license
 * Placas QR dos corredores, prontas para imprimir e colar na loja.
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Printer, ScanLine } from 'lucide-react';
import { CORREDORES_LOJA } from '../data/mockStoreData.js';
import { alcanceDoEndereco, enderecoDasPlacas, gerarUrlDoCorredor } from '../services/qrCorredor.js';

const AVISOS_DE_ALCANCE = {
  ESTE_COMPUTADOR: 'Este endereço só existe neste computador, então o celular não consegue abrir os QR codes. Para testar com a câmera antes de publicar, rode "npm run dev", abra aqui o endereço "Network" mostrado no terminal e use um celular na mesma rede Wi-Fi. Sem celular, use "Simular leitura".',
  REDE_LOCAL: 'Estes QR codes só abrem em celulares conectados à mesma rede Wi-Fi deste computador. Servem para teste: imprima as placas definitivas a partir do site publicado.'
};

export const QrPlacasView = ({ onSimularLeitura }) => {
  const aviso = AVISOS_DE_ALCANCE[alcanceDoEndereco()];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Placas QR dos Corredores
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Cada placa informa ao app em qual corredor o cliente está. Basta apontar a câmera do celular: a rota é recalculada a partir dali e o vendedor sabe onde encontrar o cliente.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 min-h-[44px] text-xs font-bold bg-[#008542] text-white rounded-xl hover:bg-[#006834] transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" />
            Imprimir placas
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600">
          Os QR codes abrem:{' '}
          <span className="font-mono font-semibold text-slate-900 break-all">{enderecoDasPlacas()}</span>
        </p>

        {aviso && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5" role="alert">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900">{aviso}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 gap-4">
        {CORREDORES_LOJA.map(corredor => (
          <article
            key={corredor.codigo}
            className="bg-white rounded-2xl border border-slate-200 print:border-slate-400 p-4 sm:p-5 shadow-xs print:shadow-none flex flex-col items-center text-center break-inside-avoid"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Corredor
            </span>
            <strong className="text-3xl font-extrabold text-[#008542] leading-tight">
              {corredor.codigo}
            </strong>
            <span className="text-xs text-slate-600 mb-3">{corredor.setor}</span>

            <QRCodeSVG
              value={gerarUrlDoCorredor(corredor.codigo)}
              size={168}
              level="M"
              marginSize={2}
              title={`QR code do Corredor ${corredor.codigo}`}
              className="print:w-[7cm] print:h-[7cm]"
            />

            <p className="text-xs font-semibold text-slate-800 mt-3">
              Aponte a câmera do celular para ver sua rota a partir daqui
            </p>

            <button
              onClick={() => onSimularLeitura(corredor.codigo)}
              className="mt-3 px-3 py-1.5 min-h-[36px] text-xs font-semibold text-[#008542] border border-[#008542]/30 rounded-lg hover:bg-[#EBF7F0] transition-colors flex items-center gap-1.5 print:hidden"
            >
              <ScanLine className="w-3.5 h-3.5" />
              Simular leitura
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
