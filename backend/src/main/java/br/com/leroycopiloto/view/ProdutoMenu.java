package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Produto;
import br.com.leroycopiloto.model.enums.Categoria;
import br.com.leroycopiloto.service.ProdutoService;

/**
 * CRUD de produtos.
 */
public class ProdutoMenu extends Menu {

    private final ProdutoService produtoService;

    public ProdutoMenu(Console console, ProdutoService produtoService) {
        super(console);
        this.produtoService = produtoService;
    }

    @Override
    protected String titulo() {
        return "PRODUTOS";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Listar produtos",
            "2 - Buscar por id",
            "3 - Pesquisar por nome",
            "4 - Cadastrar produto",
            "5 - Atualizar produto",
            "6 - Ajustar estoque",
            "7 - Excluir produto"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> console.imprimirLista("Produtos", produtoService.listar());
            case 2 -> mostrarDetalhe(produtoService.buscarPorId(console.lerId("Id do produto")));
            case 3 -> console.imprimirLista("Resultado", produtoService.pesquisar(console.lerTexto("Parte do nome")));
            case 4 -> cadastrar();
            case 5 -> atualizar();
            case 6 -> ajustarEstoque();
            case 7 -> excluir();
            default -> console.erro("Opção inválida.");
        }
    }

    private void cadastrar() {
        Produto produto = new Produto();
        produto.setSku(console.lerTexto("SKU (LM-000000)"));
        produto.setNome(console.lerTexto("Nome"));
        produto.setMarca(console.lerTexto("Marca (opcional)"));
        produto.setCategoria(console.escolher("Categoria", Categoria.class, null));
        produto.setPreco(console.lerValor("Preço", null));
        produto.setEstoque(console.lerInteiro("Estoque"));
        produto.setCorredor(corredorComCodigo(console.lerTexto("Corredor (ex.: A03)")));
        produto.setModuloGondola(console.lerTexto("Módulo da gôndola (opcional)"));
        produto.setPrateleira(console.lerTexto("Prateleira (opcional)"));
        produto.setOrdemCorredor(console.lerInteiro("Ordem no corredor"));

        produtoService.cadastrar(produto);
        console.sucesso("Produto cadastrado com id " + produto.getId() + ".");
    }

    private void atualizar() {
        Produto produto = produtoService.buscarPorId(console.lerId("Id do produto"));
        System.out.println("Enter mantém o valor atual.");
        produto.setSku(console.lerTexto("SKU", produto.getSku()));
        produto.setNome(console.lerTexto("Nome", produto.getNome()));
        produto.setMarca(console.lerTexto("Marca", produto.getMarca()));
        produto.setCategoria(console.escolher("Categoria", Categoria.class, produto.getCategoria()));
        produto.setPreco(console.lerValor("Preço", produto.getPreco()));
        produto.setEstoque(console.lerInteiro("Estoque", produto.getEstoque()));
        produto.setCorredor(corredorComCodigo(console.lerTexto("Corredor", produto.getCorredor().getCodigo())));
        produto.setModuloGondola(console.lerTexto("Módulo da gôndola", produto.getModuloGondola()));
        produto.setPrateleira(console.lerTexto("Prateleira", produto.getPrateleira()));
        produto.setOrdemCorredor(console.lerInteiro("Ordem no corredor", produto.getOrdemCorredor()));

        produtoService.atualizar(produto);
        console.sucesso("Produto atualizado.");
    }

    private void ajustarEstoque() {
        long id = console.lerId("Id do produto");
        int estoque = console.lerInteiro("Novo estoque");
        produtoService.ajustarEstoque(id, estoque);
        console.sucesso("Estoque atualizado.");
    }

    private void excluir() {
        Produto produto = produtoService.buscarPorId(console.lerId("Id do produto"));
        if (console.lerSimNao("Excluir " + produto.getNome() + "?")) {
            produtoService.excluir(produto.getId());
            console.sucesso("Produto excluído.");
        }
    }

    private void mostrarDetalhe(Produto produto) {
        System.out.println(produto);
        System.out.println("  Marca: " + produto.getMarca() + " | Categoria: " + produto.getCategoria().getDescricao());
        System.out.println("  Onde fica: " + produto.getLocalizacao());
    }

    /** O service troca este corredor pelo registro completo do banco. */
    private Corredor corredorComCodigo(String codigo) {
        Corredor corredor = new Corredor();
        corredor.setCodigo(codigo);
        return corredor;
    }
}
