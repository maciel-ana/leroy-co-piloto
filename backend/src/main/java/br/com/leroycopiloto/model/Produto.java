package br.com.leroycopiloto.model;

import br.com.leroycopiloto.model.enums.Categoria;

import java.math.BigDecimal;

/**
 * Produto exposto em um corredor. Estoque zero é uma ruptura de gôndola.
 * Tabela LCP_PRODUTO.
 */
public class Produto implements Entidade {

    private Long id;
    private String sku;
    private String nome;
    private String marca;
    private Categoria categoria;
    private BigDecimal preco;
    private int estoque;
    private Corredor corredor;
    private String moduloGondola;
    private String prateleira;
    private int ordemCorredor;

    public Produto() {
    }

    public Produto(Long id, String sku, String nome, String marca, Categoria categoria, BigDecimal preco,
                   int estoque, Corredor corredor, String moduloGondola, String prateleira, int ordemCorredor) {
        this.id = id;
        this.sku = sku;
        this.nome = nome;
        this.marca = marca;
        this.categoria = categoria;
        this.preco = preco;
        this.estoque = estoque;
        this.corredor = corredor;
        this.moduloGondola = moduloGondola;
        this.prateleira = prateleira;
        this.ordemCorredor = ordemCorredor;
    }

    public boolean isEmRuptura() {
        return estoque == 0;
    }

    /** Onde achar o produto, do jeito que aparece para o cliente. */
    public String getLocalizacao() {
        String codigoCorredor = corredor == null ? "?" : corredor.getCodigo();
        return "Corredor " + codigoCorredor + " | " + moduloGondola + " | " + prateleira;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public int getEstoque() {
        return estoque;
    }

    public void setEstoque(int estoque) {
        this.estoque = estoque;
    }

    public Corredor getCorredor() {
        return corredor;
    }

    public void setCorredor(Corredor corredor) {
        this.corredor = corredor;
    }

    public String getModuloGondola() {
        return moduloGondola;
    }

    public void setModuloGondola(String moduloGondola) {
        this.moduloGondola = moduloGondola;
    }

    public String getPrateleira() {
        return prateleira;
    }

    public void setPrateleira(String prateleira) {
        this.prateleira = prateleira;
    }

    public int getOrdemCorredor() {
        return ordemCorredor;
    }

    public void setOrdemCorredor(int ordemCorredor) {
        this.ordemCorredor = ordemCorredor;
    }

    @Override
    public String toString() {
        return String.format("#%d %s - %s | R$ %.2f | estoque %d%s",
                id, sku, nome, preco, estoque, isEmRuptura() ? " (RUPTURA)" : "");
    }
}
