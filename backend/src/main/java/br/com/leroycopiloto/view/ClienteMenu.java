package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.Cliente;
import br.com.leroycopiloto.model.enums.PerfilProjeto;
import br.com.leroycopiloto.service.ClienteService;

/**
 * CRUD de clientes.
 */
public class ClienteMenu extends Menu {

    private final ClienteService clienteService;

    public ClienteMenu(Console console, ClienteService clienteService) {
        super(console);
        this.clienteService = clienteService;
    }

    @Override
    protected String titulo() {
        return "CLIENTES";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Listar clientes",
            "2 - Buscar por id",
            "3 - Cadastrar cliente",
            "4 - Atualizar cliente",
            "5 - Excluir cliente"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> console.imprimirLista("Clientes", clienteService.listar());
            case 2 -> mostrarDetalhe(clienteService.buscarPorId(console.lerId("Id do cliente")));
            case 3 -> cadastrar();
            case 4 -> atualizar();
            case 5 -> excluir();
            default -> console.erro("Opção inválida.");
        }
    }

    private void cadastrar() {
        Cliente cliente = new Cliente();
        cliente.setNome(console.lerTexto("Nome"));
        cliente.setEmail(console.lerTexto("E-mail"));
        cliente.setTelefone(console.lerTexto("Telefone (opcional)"));
        cliente.setPerfilProjeto(console.escolher("Tipo de obra", PerfilProjeto.class, null));

        clienteService.cadastrar(cliente);
        console.sucesso("Cliente cadastrado com id " + cliente.getId() + ".");
    }

    private void atualizar() {
        Cliente cliente = clienteService.buscarPorId(console.lerId("Id do cliente"));
        System.out.println("Enter mantém o valor atual.");
        cliente.setNome(console.lerTexto("Nome", cliente.getNome()));
        cliente.setEmail(console.lerTexto("E-mail", cliente.getEmail()));
        cliente.setTelefone(console.lerTexto("Telefone", cliente.getTelefone()));
        cliente.setPerfilProjeto(console.escolher("Tipo de obra", PerfilProjeto.class, cliente.getPerfilProjeto()));

        clienteService.atualizar(cliente);
        console.sucesso("Cliente atualizado.");
    }

    private void excluir() {
        Cliente cliente = clienteService.buscarPorId(console.lerId("Id do cliente"));
        if (console.lerSimNao("Excluir " + cliente.getNome() + " e as listas de compras dele?")) {
            clienteService.excluir(cliente.getId());
            console.sucesso("Cliente excluído.");
        }
    }

    private void mostrarDetalhe(Cliente cliente) {
        System.out.println(cliente);
        System.out.println("  Telefone: " + cliente.getTelefone()
                + " | Tipo de obra: " + cliente.getPerfilProjeto().getDescricao());
    }
}
