package br.com.leroycopiloto.model;

import br.com.leroycopiloto.model.enums.Categoria;

/**
 * Assessor de vendas que recebe os chamados de ruptura. O sistema escolhe o
 * vendedor pela especialidade e pela distância até o corredor do produto.
 * Tabela LCP_VENDEDOR.
 */
public class Vendedor extends Pessoa {

    private String matricula;
    private Categoria especialidade;
    private Corredor corredorAtual;
    private boolean disponivel;

    public Vendedor() {
    }

    public Vendedor(Long id, String nome, String telefone, String matricula,
                    Categoria especialidade, Corredor corredorAtual, boolean disponivel) {
        super(id, nome, telefone);
        this.matricula = matricula;
        this.especialidade = especialidade;
        this.corredorAtual = corredorAtual;
        this.disponivel = disponivel;
    }

    @Override
    public String getIdentificacao() {
        return matricula;
    }

    /**
     * Distância a pé até um corredor. Sem posição conhecida, o vendedor fica
     * por último na escolha.
     */
    public double distanciaAte(Corredor destino) {
        if (corredorAtual == null) {
            return Double.MAX_VALUE;
        }
        return corredorAtual.distanciaAte(destino);
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public Categoria getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(Categoria especialidade) {
        this.especialidade = especialidade;
    }

    public Corredor getCorredorAtual() {
        return corredorAtual;
    }

    public void setCorredorAtual(Corredor corredorAtual) {
        this.corredorAtual = corredorAtual;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }
}
