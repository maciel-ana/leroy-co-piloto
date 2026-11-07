package br.com.leroycopiloto.model;

import br.com.leroycopiloto.model.enums.PerfilProjeto;

/**
 * Cliente que monta a lista de compras e usa o botão "Não achei" na loja.
 * Tabela LCP_CLIENTE.
 */
public class Cliente extends Pessoa {

    private String email;
    private PerfilProjeto perfilProjeto;

    public Cliente() {
    }

    public Cliente(Long id, String nome, String telefone, String email, PerfilProjeto perfilProjeto) {
        super(id, nome, telefone);
        this.email = email;
        this.perfilProjeto = perfilProjeto;
    }

    @Override
    public String getIdentificacao() {
        return email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public PerfilProjeto getPerfilProjeto() {
        return perfilProjeto;
    }

    public void setPerfilProjeto(PerfilProjeto perfilProjeto) {
        this.perfilProjeto = perfilProjeto;
    }
}
