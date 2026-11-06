/**
 * @license
 * Formatação no padrão brasileiro e normalização de texto para a busca.
 */

export const formatarPreco = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarNumero = (valor) => valor.toLocaleString('pt-BR');

/**
 * Remove acentos, troca "_" por espaço e deixa em minúsculas,
 * para "elétrica" encontrar a categoria ELETRICA.
 */
export const normalizarTexto = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/_/g, ' ')
    .toLowerCase();
