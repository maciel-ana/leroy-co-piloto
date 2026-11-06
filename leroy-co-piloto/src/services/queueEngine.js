/**
 * @license
 */

import { VENDEDORES_DISPONIVEIS } from '../data/mockStoreData.js';
import { distanciaEntreCorredores } from './routeEngine.js';

const STATUS_ABERTOS = ['AGUARDANDO_FILA', 'EM_DESLOCAMENTO', 'EM_ATENDIMENTO'];

/** Chamado que ainda depende de uma ação do vendedor ou do cliente. */
export const chamadoEstaAberto = (chamado) => STATUS_ABERTOS.includes(chamado.status);

export class FilaAtendimentoRuptura {
  constructor(chamadosIniciais = [], logInicial = []) {
    this.itens = [...chamadosIniciais];
    this.logMensageria = [...logInicial];
  }

  /**
   * Substitui o conteúdo da fila pelo estado salvo ou vindo de outra aba
   */
  restaurar(chamados = [], log = []) {
    this.itens = [...chamados];
    this.logMensageria = [...log];
  }

  /**
   * Enfileira um novo chamado
   */
  enfileirar(chamado) {
    this.itens.push(chamado);
    this.registrarEventoMensageria(
      'RUPTURA_REGISTRADA',
      chamado.id,
      chamado.corredor,
      `Novo chamado de ruptura gerado para ${chamado.produto.nome} no Corredor ${chamado.corredor}. Aguardando vendedor.`
    );
  }

  /**
   * Desenfileira o primeiro chamado atendido
   */
  desenfileirar() {
    const atendido = this.itens.shift();
    if (atendido) {
      this.registrarEventoMensageria(
        'CHAMADO_FINALIZADO',
        atendido.id,
        atendido.corredor,
        `Chamado ${atendido.id} removido da fila principal de atendimento.`
      );
    }
    return atendido;
  }

  /**
   * Retorna o primeiro elemento sem remover
   */
  espiar() {
    return this.itens[0];
  }

  /**
   * Retorna todos os chamados da fila em ordem
   */
  listarFila() {
    return [...this.itens];
  }

  tamanho() {
    return this.itens.length;
  }

  /**
   * Escolhe o vendedor disponível mais próximo do produto, dando prioridade ao
   * setor do produto. Setores sem vendedor ficam com quem estiver mais perto.
   */
  encontrarVendedorMaisApropriado(produto, vendedores = VENDEDORES_DISPONIVEIS) {
    const disponiveis = vendedores.filter(v => v.disponivel);
    const doSetor = disponiveis.filter(v => v.setorResponsavel === produto.categoria);
    const candidatos = doSetor.length > 0 ? doSetor : disponiveis.length > 0 ? disponiveis : vendedores;

    return candidatos.reduce((maisProximo, vendedor) =>
      distanciaEntreCorredores(vendedor.corredorAtual, produto.corredor) <
      distanciaEntreCorredores(maisProximo.corredorAtual, produto.corredor)
        ? vendedor
        : maisProximo
    );
  }

  /**
   * Aplica alterações a um chamado sem mexer na ordem da fila
   */
  alterarChamado(chamadoId, alteracoes) {
    const index = this.itens.findIndex(c => c.id === chamadoId);
    if (index === -1) return null;

    const chamado = { ...this.itens[index], ...alteracoes };
    this.itens[index] = chamado;
    return chamado;
  }

  /**
   * Atualiza status de um chamado na fila
   */
  atualizarStatus(chamadoId, novoStatus, vendedor) {
    const chamado = this.alterarChamado(chamadoId, {
      status: novoStatus,
      ...(vendedor ? { vendedorId: vendedor.id, vendedorNome: vendedor.nome } : {})
    });
    if (!chamado) return null;

    let tipoEvento = 'RUPTURA_REGISTRADA';
    let descricao = '';

    if (novoStatus === 'EM_DESLOCAMENTO') {
      tipoEvento = 'VENDEDOR_A_CAMINHO';
      descricao = `Vendedor ${vendedor?.nome || 'Consultor'} a caminho do Corredor ${chamado.corredor}.`;
    } else if (novoStatus === 'EM_ATENDIMENTO') {
      tipoEvento = 'ATENDIMENTO_ACEITO';
      descricao = `Vendedor ${vendedor?.nome} iniciou o atendimento presencial no Corredor ${chamado.corredor}.`;
    } else if (novoStatus === 'ESTOQUE_VAZIO_REPORTADO' || novoStatus === 'RUPTURA_CONFIRMADA') {
      tipoEvento = 'CHAMADO_FINALIZADO';
      descricao = `Estoque vazio reportado no ERP por ${vendedor?.nome || 'Consultor'}. Reposição acionada para o Corredor ${chamado.corredor}. Chamado concluído e retirado da fila.`;
    } else if (novoStatus === 'CANCELADO_PELO_CLIENTE') {
      tipoEvento = 'CHAMADO_FINALIZADO';
      descricao = `Cliente retirou ${chamado.produto.nome} da lista. Chamado cancelado.`;
    } else if (novoStatus.startsWith('CONCLUIDO')) {
      tipoEvento = 'CHAMADO_FINALIZADO';
      descricao = `Atendimento concluído com status: ${novoStatus}.`;
    }

    this.registrarEventoMensageria(tipoEvento, chamado.id, chamado.corredor, descricao);
    return chamado;
  }

  /**
   * Vendedor oferece um substituto: o chamado segue aberto até o cliente responder
   */
  oferecerSubstituto(chamadoId, substituto) {
    const chamado = this.alterarChamado(chamadoId, { produtoSubstitutoSugerido: substituto });
    if (chamado) {
      this.registrarEventoMensageria(
        'SUBSTITUTO_OFERECIDO',
        chamado.id,
        chamado.corredor,
        `Substituto ${substituto.nome} oferecido ao cliente. Aguardando resposta.`
      );
    }
    return chamado;
  }

  /**
   * Cliente recusa o substituto: o vendedor pode oferecer outro ou reportar estoque vazio
   */
  recusarSubstituto(chamadoId) {
    const chamado = this.alterarChamado(chamadoId, { produtoSubstitutoSugerido: null });
    if (chamado) {
      this.registrarEventoMensageria(
        'SUBSTITUTO_RECUSADO',
        chamado.id,
        chamado.corredor,
        'Cliente recusou o substituto oferecido.'
      );
    }
    return chamado;
  }

  registrarEventoMensageria(tipoEvento, chamadoId, corredor, descricao) {
    const evento = {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      tipoEvento,
      chamadoId,
      corredor,
      descricao
    };
    this.logMensageria.unshift(evento);
    if (this.logMensageria.length > 25) {
      this.logMensageria.pop();
    }
  }

  getHistoricoMensageria() {
    return [...this.logMensageria];
  }
}

/**
 * Cria um objeto ChamadoRuptura
 */
export function criarChamadoRuptura(
  cliente,
  produto,
  observacao = '',
  prioridade = 'ALTA_PROJETO_PARADO'
) {
  return {
    id: `CHAMADO-${Math.floor(1000 + Math.random() * 9000)}`,
    cliente,
    produto,
    corredor: produto.corredor,
    moduloGondola: produto.moduloGondola,
    status: 'AGUARDANDO_FILA',
    prioridade,
    dataHoraAbertura: new Date(),
    observacaoCliente: observacao,
    tempoEsperaSegundos: 0
  };
}
