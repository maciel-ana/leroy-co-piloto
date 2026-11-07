package br.com.leroycopiloto.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Lista de compras (a "missão") de um cliente, com os itens a coletar.
 * Tabela LCP_LISTA_COMPRA; os itens ficam em LCP_ITEM_LISTA.
 */
public class ListaCompra implements Entidade {

    private Long id;
    private Cliente cliente;
    private String nome;
    private LocalDateTime dataCriacao;
    private List<ItemLista> itens = new ArrayList<>();

    public ListaCompra() {
    }

    public ListaCompra(Long id, Cliente cliente, String nome, LocalDateTime dataCriacao) {
        this.id = id;
        this.cliente = cliente;
        this.nome = nome;
        this.dataCriacao = dataCriacao;
    }

    public BigDecimal getValorTotal() {
        BigDecimal total = BigDecimal.ZERO;
        for (ItemLista item : itens) {
            total = total.add(item.getSubtotal());
        }
        return total;
    }

    public long getQuantidadeColetada() {
        return itens.stream().filter(ItemLista::isColetado).count();
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public List<ItemLista> getItens() {
        return itens;
    }

    public void setItens(List<ItemLista> itens) {
        this.itens = itens;
    }

    @Override
    public String toString() {
        return String.format("#%d %s - %s | %d itens (%d coletados) | R$ %.2f",
                id, nome, cliente == null ? "?" : cliente.getNome(),
                itens.size(), getQuantidadeColetada(), getValorTotal());
    }
}
