package br.com.leroycopiloto.model.enums;

/**
 * Categoria do produto e especialidade do vendedor. Os nomes batem com o
 * CHECK das tabelas LCP_PRODUTO e LCP_VENDEDOR.
 */
public enum Categoria {

    MATERIAIS_CONSTRUCAO("Materiais de construção"),
    HIDRAULICA("Hidráulica"),
    ELETRICA("Elétrica"),
    TINTAS_ACESSORIOS("Tintas e acessórios"),
    FERRAMENTAS("Ferramentas");

    private final String descricao;

    Categoria(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
