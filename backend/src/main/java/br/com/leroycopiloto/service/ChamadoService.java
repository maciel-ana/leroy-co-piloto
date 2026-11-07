package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.ChamadoRupturaDao;
import br.com.leroycopiloto.dao.ProdutoDao;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.exception.OperacaoInvalidaException;
import br.com.leroycopiloto.model.ChamadoRuptura;
import br.com.leroycopiloto.model.Cliente;
import br.com.leroycopiloto.model.Produto;
import br.com.leroycopiloto.model.Vendedor;
import br.com.leroycopiloto.model.enums.PrioridadeChamado;
import br.com.leroycopiloto.model.enums.StatusChamado;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Botão "Não achei" e fila de atendimento dos vendedores.
 */
public class ChamadoService {

    private final ChamadoRupturaDao chamadoDao;
    private final ProdutoDao produtoDao;
    private final ClienteService clienteService;
    private final ProdutoService produtoService;
    private final VendedorService vendedorService;

    public ChamadoService(ChamadoRupturaDao chamadoDao, ProdutoDao produtoDao, ClienteService clienteService,
                          ProdutoService produtoService, VendedorService vendedorService) {
        this.chamadoDao = chamadoDao;
        this.produtoDao = produtoDao;
        this.clienteService = clienteService;
        this.produtoService = produtoService;
        this.vendedorService = vendedorService;
    }

    /**
     * Abre um chamado e já escolhe o vendedor que vai atender.
     */
    public ChamadoRuptura abrir(long idCliente, long idProduto, PrioridadeChamado prioridade, String observacao) {
        Cliente cliente = clienteService.buscarPorId(idCliente);
        Produto produto = produtoService.buscarPorId(idProduto);
        if (chamadoDao.buscarAberto(idCliente, idProduto).isPresent()) {
            throw new OperacaoInvalidaException("Esse cliente já tem um chamado aberto para " + produto.getNome() + ".");
        }

        ChamadoRuptura chamado = new ChamadoRuptura();
        chamado.setCliente(cliente);
        chamado.setProduto(produto);
        chamado.setPrioridade(Validador.naoNulo(prioridade, "prioridade"));
        chamado.setObservacao(Validador.opcional(observacao, "observação", 400));
        chamado.setStatus(StatusChamado.AGUARDANDO_FILA);
        chamado.setDataAbertura(LocalDateTime.now().withNano(0));
        chamado.setVendedor(escolherVendedor(produto, vendedorService.listar()));
        return chamadoDao.inserir(chamado);
    }

    /**
     * Escolhe quem atende: entre os disponíveis, prefere quem é do setor do
     * produto e, entre eles, quem está mais perto do corredor. Se ninguém do
     * setor estiver livre, vai o disponível mais próximo.
     *
     * @return o vendedor escolhido, ou null se não houver ninguém disponível
     */
    public Vendedor escolherVendedor(Produto produto, List<Vendedor> vendedores) {
        List<Vendedor> disponiveis = new ArrayList<>();
        List<Vendedor> doSetor = new ArrayList<>();
        for (Vendedor vendedor : vendedores) {
            if (vendedor.isDisponivel()) {
                disponiveis.add(vendedor);
                if (vendedor.getEspecialidade() == produto.getCategoria()) {
                    doSetor.add(vendedor);
                }
            }
        }
        List<Vendedor> candidatos = doSetor.isEmpty() ? disponiveis : doSetor;

        Vendedor escolhido = null;
        for (Vendedor vendedor : candidatos) {
            if (escolhido == null
                    || vendedor.distanciaAte(produto.getCorredor()) < escolhido.distanciaAte(produto.getCorredor())) {
                escolhido = vendedor;
            }
        }
        return escolhido;
    }

    public List<ChamadoRuptura> listar() {
        return chamadoDao.listar();
    }

    public List<ChamadoRuptura> listarFila() {
        return chamadoDao.listarFila();
    }

    public ChamadoRuptura buscarPorId(long id) {
        return chamadoDao.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Chamado #" + id + " não encontrado."));
    }

    /**
     * Avança o atendimento. Status de encerramento gravam a data de
     * fechamento; ruptura confirmada também zera o estoque do produto.
     */
    public ChamadoRuptura atualizarStatus(long idChamado, StatusChamado novoStatus) {
        ChamadoRuptura chamado = buscarAbertoParaAlterar(idChamado);
        chamado.setStatus(Validador.naoNulo(novoStatus, "status"));
        if (!novoStatus.isAberto()) {
            chamado.setDataFechamento(LocalDateTime.now().withNano(0));
        }
        chamadoDao.atualizar(chamado);

        if (novoStatus == StatusChamado.RUPTURA_CONFIRMADA) {
            produtoDao.atualizarEstoque(chamado.getProduto().getId(), 0);
        }
        return chamado;
    }

    public ChamadoRuptura alterarDetalhes(long idChamado, PrioridadeChamado prioridade, String observacao) {
        ChamadoRuptura chamado = buscarAbertoParaAlterar(idChamado);
        chamado.setPrioridade(Validador.naoNulo(prioridade, "prioridade"));
        chamado.setObservacao(Validador.opcional(observacao, "observação", 400));
        chamadoDao.atualizar(chamado);
        return chamado;
    }

    public ChamadoRuptura reatribuir(long idChamado, long idVendedor) {
        ChamadoRuptura chamado = buscarAbertoParaAlterar(idChamado);
        Vendedor vendedor = vendedorService.buscarPorId(idVendedor);
        if (!vendedor.isDisponivel()) {
            throw new OperacaoInvalidaException(vendedor.getNome() + " está indisponível no momento.");
        }
        chamado.setVendedor(vendedor);
        chamadoDao.atualizar(chamado);
        return chamado;
    }

    public void excluir(long idChamado) {
        buscarPorId(idChamado);
        chamadoDao.excluir(idChamado);
    }

    private ChamadoRuptura buscarAbertoParaAlterar(long idChamado) {
        ChamadoRuptura chamado = buscarPorId(idChamado);
        if (!chamado.isAberto()) {
            throw new OperacaoInvalidaException("O chamado #" + idChamado + " já foi encerrado ("
                    + chamado.getStatus() + ") e não pode mais ser alterado.");
        }
        return chamado;
    }
}
