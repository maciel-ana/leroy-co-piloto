package br.com.leroycopiloto.model.enums;

/**
 * Tipo de obra do cliente, usado pelo vendedor para um atendimento consultivo.
 */
public enum PerfilProjeto {

    REFORMA_BANHEIRO("Reforma de banheiro"),
    PINTURA_COMPLETA("Pintura completa"),
    INSTALACAO_ELETRICA("Instalação elétrica"),
    OUTRO("Outro");

    private final String descricao;

    PerfilProjeto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
