/**
 * @license
 * QR code por URL: cada placa aponta para "?corredor=A03". A câmera do celular
 * abre o link e o app descobre onde o cliente está, sem leitor dentro do app.
 */

import { CORREDORES_LOJA } from '../data/mockStoreData.js';

const PARAMETRO_CORREDOR = 'corredor';

/**
 * @returns {{corredor: string} | {invalido: string} | null}
 *   null quando a URL não veio de um QR.
 */
export function lerCorredorDaUrl() {
  const valor = new URLSearchParams(window.location.search).get(PARAMETRO_CORREDOR);
  if (valor === null) return null;

  const codigo = valor.trim().toUpperCase();
  return CORREDORES_LOJA.some(c => c.codigo === codigo)
    ? { corredor: codigo }
    : { invalido: valor.trim().slice(0, 20) };
}

/** Tira o parâmetro da URL para recarregar a página não repetir a leitura. */
export function limparCorredorDaUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAMETRO_CORREDOR);
  window.history.replaceState(null, '', url);
}

/** Endereço para o qual as placas apontam: o mesmo em que esta página foi aberta. */
export function enderecoDasPlacas() {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}`;
}

export function gerarUrlDoCorredor(codigo) {
  return `${enderecoDasPlacas()}?${PARAMETRO_CORREDOR}=${codigo}`;
}

/**
 * Diz de onde um celular consegue abrir os QR codes gerados nesta página:
 * 'ESTE_COMPUTADOR' (de nenhum), 'REDE_LOCAL' (só na mesma Wi-Fi) ou 'PUBLICO'.
 */
export function alcanceDoEndereco() {
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '[::1]' || hostname.startsWith('127.')) {
    return 'ESTE_COMPUTADOR';
  }
  if (hostname.endsWith('.local') || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) {
    return 'REDE_LOCAL';
  }
  return 'PUBLICO';
}
