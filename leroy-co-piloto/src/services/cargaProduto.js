/**
 * @license
 * Carga de cada produto no carrinho. A rota por regras, o que a IA recebe e a
 * etiqueta na tela usam esta mesma classificação.
 */

const PESO_PESADO = 10;
const PESO_MEDIO = 5;

const PESO_POR_CATEGORIA = {
  MATERIAIS_CONSTRUCAO: PESO_PESADO,
  HIDRAULICA: 8,
  FERRAMENTAS: 3,
  ELETRICA: 1
};

// Tintas e acessórios têm cargas bem diferentes: a lata é pesada, o rolo é leve.
const ehVendidoEmLitros = (produto) => /\b\d+(?:[.,]\d+)?\s*L\b/.test(produto.nome);

export function pesoDaCarga(produto) {
  if (produto?.categoria === 'TINTAS_ACESSORIOS') {
    return ehVendidoEmLitros(produto) ? PESO_PESADO : 1;
  }
  return PESO_POR_CATEGORIA[produto?.categoria] ?? 0;
}

/** @returns {'PESADA' | 'MEDIA' | 'LEVE'} */
export function classificarCarga(produto) {
  const peso = pesoDaCarga(produto);
  if (peso >= PESO_PESADO) return 'PESADA';
  if (peso >= PESO_MEDIO) return 'MEDIA';
  return 'LEVE';
}
