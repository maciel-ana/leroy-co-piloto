package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.ListaCompraDao;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.ItemLista;
import br.com.leroycopiloto.model.ListaCompra;
import br.com.leroycopiloto.model.Produto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Modo Missão: listas de compras, itens e a rota dentro da loja.
 */
public class ListaCompraService {

    private final ListaCompraDao listaDao;
    private final ClienteService clienteService;
    private final ProdutoService produtoService;
    private final LojaService lojaService;

    public ListaCompraService(ListaCompraDao listaDao, ClienteService clienteService,
                              ProdutoService produtoService, LojaService lojaService) {
        this.listaDao = listaDao;
        this.clienteService = clienteService;
        this.produtoService = produtoService;
        this.lojaService = lojaService;
    }

    public ListaCompra criar(long idCliente, String nome) {
        ListaCompra lista = new ListaCompra();
        lista.setCliente(clienteService.buscarPorId(idCliente));
        lista.setNome(Validador.obrigatorio(nome, "nome da lista", 80));
        return listaDao.inserir(lista);
    }

    public List<ListaCompra> listar() {
        return listaDao.listar();
    }

    public List<ListaCompra> listarPorCliente(long idCliente) {
        clienteService.buscarPorId(idCliente);
        return listaDao.listarPorCliente(idCliente);
    }

    public ListaCompra buscarPorId(long id) {
        return listaDao.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Lista de compras #" + id + " não encontrada."));
    }

    public ListaCompra renomear(long idLista, String novoNome) {
        ListaCompra lista = buscarPorId(idLista);
        lista.setNome(Validador.obrigatorio(novoNome, "nome da lista", 80));
        listaDao.atualizar(lista);
        return lista;
    }

    public void excluir(long idLista) {
        buscarPorId(idLista);
        listaDao.excluir(idLista);
    }

    /**
     * Coloca o produto na lista. Se ele já estiver lá, só troca a quantidade.
     */
    public ListaCompra adicionarItem(long idLista, long idProduto, int quantidade) {
        ListaCompra lista = buscarPorId(idLista);
        Produto produto = produtoService.buscarPorId(idProduto);
        Validador.intervalo(quantidade, "quantidade", 1, 999);

        Optional<ItemLista> existente = buscarItem(lista, idProduto);
        if (existente.isPresent()) {
            existente.get().setQuantidade(quantidade);
            listaDao.atualizarItem(idLista, existente.get());
        } else {
            listaDao.adicionarItem(idLista, new ItemLista(produto, quantidade, false));
        }
        return buscarPorId(idLista);
    }

    public ListaCompra marcarColetado(long idLista, long idProduto, boolean coletado) {
        ListaCompra lista = buscarPorId(idLista);
        ItemLista item = buscarItem(lista, idProduto).orElseThrow(() ->
                new NaoEncontradoException("O produto #" + idProduto + " não está na lista #" + idLista + "."));
        item.setColetado(coletado);
        listaDao.atualizarItem(idLista, item);
        return buscarPorId(idLista);
    }

    public ListaCompra removerItem(long idLista, long idProduto) {
        buscarPorId(idLista);
        if (!listaDao.removerItem(idLista, idProduto)) {
            throw new NaoEncontradoException("O produto #" + idProduto + " não está na lista #" + idLista + ".");
        }
        return buscarPorId(idLista);
    }

    /**
     * Ordem para coletar os itens que faltam.
     *
     * <p>Sem posição conhecida, segue a ordem física da loja. Com o corredor
     * da última placa QR lida, vai sempre para o item pendente mais próximo.
     * É a mesma lógica do protótipo web (routeEngine.js).</p>
     *
     * @param codigoCorredorAtual corredor onde o cliente está, ou vazio/null
     */
    public List<ItemLista> calcularRota(long idLista, String codigoCorredorAtual) {
        List<ItemLista> pendentes = new ArrayList<>();
        for (ItemLista item : buscarPorId(idLista).getItens()) {
            if (!item.isColetado()) {
                pendentes.add(item);
            }
        }
        pendentes.sort(Comparator
                .comparingInt((ItemLista i) -> i.getProduto().getOrdemCorredor())
                .thenComparing(i -> i.getProduto().getNome()));

        if (codigoCorredorAtual == null || codigoCorredorAtual.isBlank()) {
            return pendentes;
        }

        Corredor posicao = lojaService.buscarCorredor(codigoCorredorAtual);
        List<ItemLista> rota = new ArrayList<>();
        while (!pendentes.isEmpty()) {
            ItemLista maisProximo = pendentes.get(0);
            for (ItemLista item : pendentes) {
                if (posicao.distanciaAte(item.getProduto().getCorredor())
                        < posicao.distanciaAte(maisProximo.getProduto().getCorredor())) {
                    maisProximo = item;
                }
            }
            pendentes.remove(maisProximo);
            rota.add(maisProximo);
            posicao = maisProximo.getProduto().getCorredor();
        }
        return rota;
    }

    private Optional<ItemLista> buscarItem(ListaCompra lista, long idProduto) {
        return lista.getItens().stream()
                .filter(i -> i.getProduto().getId() == idProduto)
                .findFirst();
    }
}
