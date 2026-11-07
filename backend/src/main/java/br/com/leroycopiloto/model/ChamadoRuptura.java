package br.com.leroycopiloto.model;

import br.com.leroycopiloto.model.enums.PrioridadeChamado;
import br.com.leroycopiloto.model.enums.StatusChamado;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Chamado aberto quando o cliente aperta "Não achei": liga o cliente, o
 * produto e o vendedor escolhido para atender. Tabela LCP_CHAMADO_RUPTURA.
 */
public class ChamadoRuptura implements Entidade {

    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("dd/MM HH:mm");

    private Long id;
    private Cliente cliente;
    private Produto produto;
    private Vendedor vendedor;
    private StatusChamado status;
    private PrioridadeChamado prioridade;
    private String observacao;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataFechamento;

    public ChamadoRuptura() {
    }

    public ChamadoRuptura(Long id, Cliente cliente, Produto produto, Vendedor vendedor, StatusChamado status,
                          PrioridadeChamado prioridade, String observacao,
                          LocalDateTime dataAbertura, LocalDateTime dataFechamento) {
        this.id = id;
        this.cliente = cliente;
        this.produto = produto;
        this.vendedor = vendedor;
        this.status = status;
        this.prioridade = prioridade;
        this.observacao = observacao;
        this.dataAbertura = dataAbertura;
        this.dataFechamento = dataFechamento;
    }

    public boolean isAberto() {
        return status != null && status.isAberto();
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

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Vendedor getVendedor() {
        return vendedor;
    }

    public void setVendedor(Vendedor vendedor) {
        this.vendedor = vendedor;
    }

    public StatusChamado getStatus() {
        return status;
    }

    public void setStatus(StatusChamado status) {
        this.status = status;
    }

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeChamado prioridade) {
        this.prioridade = prioridade;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(LocalDateTime dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public LocalDateTime getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(LocalDateTime dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    @Override
    public String toString() {
        return String.format("#%d [%s] %s | %s no %s | cliente: %s | vendedor: %s | aberto em %s",
                id, status, prioridade.getDescricao(), produto.getNome(),
                produto.getCorredor() == null ? "?" : produto.getCorredor().getCodigo(),
                cliente.getNome(), vendedor == null ? "sem vendedor" : vendedor.getNome(),
                dataAbertura == null ? "-" : dataAbertura.format(FORMATO_HORA));
    }
}
