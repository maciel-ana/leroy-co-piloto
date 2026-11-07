package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.ProdutoDao;
import br.com.leroycopiloto.exception.DadosInvalidosException;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.model.Produto;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Regras do cadastro de produtos.
 */
public class ProdutoService {

    private static final Pattern SKU = Pattern.compile("^LM-\\d{6}$");

    private final ProdutoDao produtoDao;
    private final LojaService lojaService;

    public ProdutoService(ProdutoDao produtoDao, LojaService lojaService) {
        this.produtoDao = produtoDao;
        this.lojaService = lojaService;
    }

    /**
     * @param produto dados do produto; o corredor só precisa ter o código preenchido
     */
    public Produto cadastrar(Produto produto) {
        validar(produto);
        garantirSkuLivre(produto.getSku(), null);
        return produtoDao.inserir(produto);
    }

    public List<Produto> listar() {
        return produtoDao.listar();
    }

    public List<Produto> pesquisar(String trechoDoNome) {
        String trecho = Validador.obrigatorio(trechoDoNome, "nome para pesquisa", 120);
        return produtoDao.buscarPorNome(trecho);
    }

    public Produto buscarPorId(long id) {
        return produtoDao.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Produto #" + id + " não encontrado."));
    }

    public Produto atualizar(Produto produto) {
        buscarPorId(produto.getId());
        validar(produto);
        garantirSkuLivre(produto.getSku(), produto.getId());
        produtoDao.atualizar(produto);
        return produto;
    }

    public void ajustarEstoque(long idProduto, int novoEstoque) {
        buscarPorId(idProduto);
        Validador.intervalo(novoEstoque, "estoque", 0, 999_999);
        produtoDao.atualizarEstoque(idProduto, novoEstoque);
    }

    public void excluir(long id) {
        buscarPorId(id);
        produtoDao.excluir(id);
    }

    private void validar(Produto produto) {
        produto.setSku(Validador.formato(produto.getSku(), "SKU", SKU, "LM-000000"));
        produto.setNome(Validador.obrigatorio(produto.getNome(), "nome", 120));
        produto.setMarca(Validador.opcional(produto.getMarca(), "marca", 60));
        Validador.naoNulo(produto.getCategoria(), "categoria");
        Validador.naoNegativo(produto.getPreco(), "preço");
        Validador.intervalo(produto.getEstoque(), "estoque", 0, 999_999);
        Validador.naoNulo(produto.getCorredor(), "corredor");
        produto.setCorredor(lojaService.buscarCorredor(produto.getCorredor().getCodigo()));
        produto.setModuloGondola(Validador.opcional(produto.getModuloGondola(), "módulo da gôndola", 40));
        produto.setPrateleira(Validador.opcional(produto.getPrateleira(), "prateleira", 60));
        Validador.intervalo(produto.getOrdemCorredor(), "ordem no corredor", 0, 9999);
    }

    private void garantirSkuLivre(String sku, Long idAtual) {
        Optional<Produto> existente = produtoDao.buscarPorSku(sku);
        if (existente.isPresent() && !existente.get().getId().equals(idAtual)) {
            throw new DadosInvalidosException("Já existe um produto com o SKU " + sku + ".");
        }
    }
}
