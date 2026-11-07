package br.com.leroycopiloto.model;

/**
 * Setor da loja que agrupa corredores (ex.: Elétrica & Iluminação).
 * Tabela LCP_SETOR.
 */
public class Setor implements Entidade {

    private Long id;
    private String codigo;
    private String nome;

    public Setor() {
    }

    public Setor(Long id, String codigo, String nome) {
        this.id = id;
        this.codigo = codigo;
        this.nome = nome;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return codigo + " - " + nome;
    }
}
