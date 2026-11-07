package br.com.leroycopiloto.model.enums;

/**
 * Situação de um chamado de ruptura. Os quatro primeiros mantêm o chamado
 * na fila; os demais encerram o atendimento.
 */
public enum StatusChamado {

    AGUARDANDO_FILA(true),
    EM_DESLOCAMENTO(true),
    EM_ATENDIMENTO(true),
    SUBSTITUTO_OFERECIDO(true),
    CONCLUIDO_PRODUTO_ENCONTRADO(false),
    CONCLUIDO_COM_SUBSTITUTO(false),
    RUPTURA_CONFIRMADA(false),
    CANCELADO_PELO_CLIENTE(false);

    private final boolean aberto;

    StatusChamado(boolean aberto) {
        this.aberto = aberto;
    }

    public boolean isAberto() {
        return aberto;
    }
}
