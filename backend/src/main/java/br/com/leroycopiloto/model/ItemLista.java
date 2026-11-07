package br.com.leroycopiloto.model;

import java.math.BigDecimal;

/**
 * Linha da tabela associativa LCP_ITEM_LISTA, que resolve o N:N entre
 * {@link ListaCompra} e {@link Produto}. Não tem id próprio: a chave é o par
 * (lista, produto).
 */
public class ItemLista {

    private Produto produto;
    private int quantidade;
    private boolean coletado;

    public ItemLista() {
    }

    public ItemLista(Produto produto, int quantidade, boolean coletado) {
        this.produto = produto;
        this.quantidade = quantidade;
        this.coletado = coletado;
    }

    public BigDecimal getSubtotal() {
        return produto.getPreco().multiply(BigDecimal.valueOf(quantidade));
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public boolean isColetado() {
        return coletado;
    }

    public void setColetado(boolean coletado) {
        this.coletado = coletado;
    }

    @Override
    public String toString() {
        return String.format("[%s] %dx %s - %s", coletado ? "x" : " ", quantidade,
                produto.getNome(), produto.getLocalizacao());
    }
}
