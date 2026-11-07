package br.com.leroycopiloto.model.enums;

/**
 * Urgência informada pelo cliente. A ordem das constantes é a ordem da fila:
 * quem está com a obra parada é atendido primeiro.
 */
public enum PrioridadeChamado {

    ALTA_PROJETO_PARADO("Alta - obra parada"),
    MEDIA("Média"),
    BAIXA("Baixa");

    private final String descricao;

    PrioridadeChamado(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
