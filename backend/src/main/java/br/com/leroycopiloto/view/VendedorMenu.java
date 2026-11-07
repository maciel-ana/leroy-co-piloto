package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Vendedor;
import br.com.leroycopiloto.model.enums.Categoria;
import br.com.leroycopiloto.service.VendedorService;

/**
 * CRUD de vendedores e atualização da posição na loja.
 */
public class VendedorMenu extends Menu {

    private final VendedorService vendedorService;

    public VendedorMenu(Console console, VendedorService vendedorService) {
        super(console);
        this.vendedorService = vendedorService;
    }

    @Override
    protected String titulo() {
        return "VENDEDORES";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Listar vendedores",
            "2 - Buscar por id",
            "3 - Cadastrar vendedor",
            "4 - Atualizar vendedor",
            "5 - Registrar corredor atual",
            "6 - Marcar disponível / indisponível",
            "7 - Excluir vendedor"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> listar();
            case 2 -> mostrarDetalhe(vendedorService.buscarPorId(console.lerId("Id do vendedor")));
            case 3 -> cadastrar();
            case 4 -> atualizar();
            case 5 -> moverPara();
            case 6 -> alterarDisponibilidade();
            case 7 -> excluir();
            default -> console.erro("Opção inválida.");
        }
    }

    private void listar() {
        System.out.println();
        System.out.println("--- Vendedores ---");
        for (Vendedor vendedor : vendedorService.listar()) {
            mostrarDetalhe(vendedor);
        }
    }

    private void cadastrar() {
        Vendedor vendedor = new Vendedor();
        vendedor.setMatricula(console.lerTexto("Matrícula (LM-0000)"));
        vendedor.setNome(console.lerTexto("Nome"));
        vendedor.setTelefone(console.lerTexto("Telefone (opcional)"));
        vendedor.setEspecialidade(console.escolher("Especialidade", Categoria.class, null));
        vendedor.setCorredorAtual(corredorComCodigo(console.lerTexto("Corredor atual (opcional, ex.: B02)")));
        vendedor.setDisponivel(console.lerSimNao("Está disponível agora?"));

        vendedorService.cadastrar(vendedor);
        console.sucesso("Vendedor cadastrado com id " + vendedor.getId() + ".");
    }

    private void atualizar() {
        Vendedor vendedor = vendedorService.buscarPorId(console.lerId("Id do vendedor"));
        String corredorAtual = vendedor.getCorredorAtual() == null ? null : vendedor.getCorredorAtual().getCodigo();
        System.out.println("Enter mantém o valor atual.");
        vendedor.setMatricula(console.lerTexto("Matrícula", vendedor.getMatricula()));
        vendedor.setNome(console.lerTexto("Nome", vendedor.getNome()));
        vendedor.setTelefone(console.lerTexto("Telefone", vendedor.getTelefone()));
        vendedor.setEspecialidade(console.escolher("Especialidade", Categoria.class, vendedor.getEspecialidade()));
        vendedor.setCorredorAtual(corredorComCodigo(console.lerTexto("Corredor atual", corredorAtual)));

        vendedorService.atualizar(vendedor);
        console.sucesso("Vendedor atualizado.");
    }

    private void moverPara() {
        long id = console.lerId("Id do vendedor");
        Vendedor vendedor = vendedorService.moverPara(id, console.lerTexto("Corredor (ex.: C01)"));
        console.sucesso(vendedor.getNome() + " agora está no corredor " + vendedor.getCorredorAtual().getCodigo() + ".");
    }

    private void alterarDisponibilidade() {
        long id = console.lerId("Id do vendedor");
        Vendedor vendedor = vendedorService.alterarDisponibilidade(id, console.lerSimNao("Disponível?"));
        console.sucesso(vendedor.getNome() + (vendedor.isDisponivel() ? " está disponível." : " está indisponível."));
    }

    private void excluir() {
        Vendedor vendedor = vendedorService.buscarPorId(console.lerId("Id do vendedor"));
        if (console.lerSimNao("Excluir " + vendedor.getNome() + "?")) {
            vendedorService.excluir(vendedor.getId());
            console.sucesso("Vendedor excluído.");
        }
    }

    private void mostrarDetalhe(Vendedor vendedor) {
        System.out.printf("%s | %s | corredor %s | %s%n", vendedor, vendedor.getEspecialidade().getDescricao(),
                vendedor.getCorredorAtual() == null ? "-" : vendedor.getCorredorAtual().getCodigo(),
                vendedor.isDisponivel() ? "disponível" : "indisponível");
    }

    /** Vazio vira null (sem corredor); o service busca o registro completo. */
    private Corredor corredorComCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return null;
        }
        Corredor corredor = new Corredor();
        corredor.setCodigo(codigo);
        return corredor;
    }
}
