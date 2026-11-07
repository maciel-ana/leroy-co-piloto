package br.com.leroycopiloto.model;

/**
 * Base de quem usa o sistema: o cliente no Modo Missão e o vendedor no
 * Modo Consultor. Concentra os dados que os dois têm em comum.
 */
public abstract class Pessoa implements Entidade {

    private Long id;
    private String nome;
    private String telefone;

    protected Pessoa() {
    }

    protected Pessoa(Long id, String nome, String telefone) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
    }

    /**
     * Identificação de negócio mostrada nas telas (e-mail do cliente,
     * matrícula do vendedor). Cada subclasse decide qual é a sua.
     */
    public abstract String getIdentificacao();

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    @Override
    public String toString() {
        return String.format("#%d %s (%s)", id, nome, getIdentificacao());
    }
}
