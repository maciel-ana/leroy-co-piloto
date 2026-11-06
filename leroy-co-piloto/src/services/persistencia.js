/**
 * @license
 * Guarda a demonstração no navegador, para ela sobreviver a recarregar a página
 * e à abertura do link de um QR code, que chega em uma aba nova.
 * Sem o localStorage (ex.: navegação privada restrita), o app segue em memória.
 */

const CHAVE_ESTADO = 'leroy-co-piloto:estado:v1';

const interpretarEstado = (bruto) => {
  if (!bruto) return null;
  try {
    const estado = JSON.parse(bruto);
    return Array.isArray(estado?.itensRota) && Array.isArray(estado?.chamadosFila) ? estado : null;
  } catch {
    return null;
  }
};

export function carregarEstado() {
  try {
    return interpretarEstado(window.localStorage.getItem(CHAVE_ESTADO));
  } catch {
    return null;
  }
}

export function salvarEstado(estado) {
  try {
    window.localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
  } catch {
    // Sem armazenamento disponível: o estado continua apenas nesta aba.
  }
}

/**
 * Avisa quando outra aba do mesmo navegador altera a demonstração.
 * Retorna a função que cancela a assinatura.
 */
export function assinarMudancas(aoMudar) {
  const tratarEvento = (evento) => {
    if (evento.key !== CHAVE_ESTADO) return;
    const estado = interpretarEstado(evento.newValue);
    if (estado) aoMudar(estado);
  };
  window.addEventListener('storage', tratarEvento);
  return () => window.removeEventListener('storage', tratarEvento);
}
