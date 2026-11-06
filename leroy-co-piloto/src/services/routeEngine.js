/**
 * @license
 * @param {Array} itens
 * @returns {Array}
 */

import { CORREDORES_LOJA } from '../data/mockStoreData.js';

// Geometria do mapa: toda a circulação passa pelo corredor central da loja.
const Y_CIRCULACAO = 155;
const ENTRADA_MAPA = { x: 285, y: 270 };

const buscarCorredor = (codigo) => CORREDORES_LOJA.find(c => c.codigo === codigo);
const centroX = (corredor) => corredor.x + corredor.largura / 2;

// Ponto da borda do corredor voltado para a circulação central
const bordaY = (corredor) =>
  corredor.y + corredor.altura <= Y_CIRCULACAO ? corredor.y + corredor.altura : corredor.y;

export function ordenarListaLinear(itens) {
  return [...itens].sort((a, b) => {
    // 1. Prioriza ordem física do corredor
    if (a.produto.ordemCorredor !== b.produto.ordemCorredor) {
      return a.produto.ordemCorredor - b.produto.ordemCorredor;
    }
    // 2. Desempate por nome
    return a.produto.nome.localeCompare(b.produto.nome);
  });
}

/**
 * Distância a pé entre dois corredores, indo pela circulação central do mapa.
 */
export function distanciaEntreCorredores(codigoA, codigoB) {
  if (codigoA === codigoB) return 0;
  const a = buscarCorredor(codigoA);
  const b = buscarCorredor(codigoB);
  if (!a || !b) return Infinity;
  return (
    Math.abs(centroX(a) - centroX(b)) +
    Math.abs(bordaY(a) - Y_CIRCULACAO) +
    Math.abs(bordaY(b) - Y_CIRCULACAO)
  );
}

/**
 * Sem posição conhecida, segue a ordem física da loja. Depois de ler um QR,
 * parte do corredor atual e vai sempre para o item pendente mais próximo.
 * Os itens já coletados ficam no início, porque não fazem mais parte do trajeto.
 */
export function ordenarRota(itens, corredorAtual) {
  const linear = ordenarListaLinear(itens);
  if (!buscarCorredor(corredorAtual)) return linear;

  const coletados = linear.filter(i => i.coletado);
  const pendentes = linear.filter(i => !i.coletado);
  const rota = [];
  let posicao = corredorAtual;

  while (pendentes.length > 0) {
    const proximo = pendentes.reduce((maisPerto, item) =>
      distanciaEntreCorredores(posicao, item.produto.corredor) <
      distanciaEntreCorredores(posicao, maisPerto.produto.corredor)
        ? item
        : maisPerto
    );
    pendentes.splice(pendentes.indexOf(proximo), 1);
    rota.push(proximo);
    posicao = proximo.produto.corredor;
  }

  return [...coletados, ...rota];
}

/**
 * Desenha o trajeto do mapa a partir da posição do cliente (ou da entrada da loja),
 * parando nos corredores na ordem recebida.
 * @returns {{caminho: string, paradas: Array<{codigo: string, x: number, y: number}>}}
 */
export function gerarCaminhoRota(corredorOrigem, codigosParadas) {
  const origem = buscarCorredor(corredorOrigem);
  const corredores = codigosParadas.map(buscarCorredor).filter(Boolean);
  if (corredores.length === 0) return { caminho: '', paradas: [] };

  const inicio = origem ? { x: centroX(origem), y: bordaY(origem) } : ENTRADA_MAPA;
  const pontos = [inicio, { x: inicio.x, y: Y_CIRCULACAO }];

  corredores.forEach((corredor, indice) => {
    // O cliente já está na primeira parada: o trajeto sai direto dali
    if (indice === 0 && corredor === origem) return;
    pontos.push(
      { x: centroX(corredor), y: Y_CIRCULACAO },
      { x: centroX(corredor), y: bordaY(corredor) },
      { x: centroX(corredor), y: Y_CIRCULACAO }
    );
  });
  // O trajeto termina na última parada, sem voltar para a circulação
  pontos.pop();

  return {
    caminho: pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    paradas: corredores.map(c => ({ codigo: c.codigo, x: centroX(c), y: bordaY(c) }))
  };
}

/**
 * Calcula métricas de percurso da rota inteligente
 * @param {Array} itens
 * @returns {Object}
 */
export function calcularEstatisticasRota(itens) {
  const total = itens.length;
  const coletados = itens.filter(i => i.coletado).length;

  if (total === 0) {
    return {
      totalItens: 0,
      itensColetados: 0,
      distanciaEstimadaMetros: 0,
      tempoEstimadoMinutos: 0,
      tempoEconomizadoMinutos: 0,
      sequenciaCorredores: []
    };
  }

  // Corredores únicos na ordem ordenada
  const corredores = Array.from(new Set(itens.map(i => i.produto.corredor)));

  // Estimativa para loja de grande porte ~15.000m²:
  const distanciaMetros = Math.max(80, corredores.length * 45 + total * 15);
  const tempoMinutos = Math.round((distanciaMetros / 70) + (total * 1.5));

  // Economia estimada em relação a um trajeto aleatório
  const tempoEconomizado = Math.max(4, Math.round(tempoMinutos * 0.45));

  return {
    totalItens: total,
    itensColetados: coletados,
    distanciaEstimadaMetros: distanciaMetros,
    tempoEstimadoMinutos: tempoMinutos,
    tempoEconomizadoMinutos: tempoEconomizado,
    sequenciaCorredores: corredores
  };
}
