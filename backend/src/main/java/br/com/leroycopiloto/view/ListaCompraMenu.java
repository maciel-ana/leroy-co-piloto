package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.ItemLista;
import br.com.leroycopiloto.model.ListaCompra;
import br.com.leroycopiloto.service.ListaCompraService;

import java.util.List;

/**
 * Modo Missão: CRUD das listas de compras, dos itens e cálculo da rota.
 */
public class ListaCompraMenu extends Menu {

    private final ListaCompraService listaService;

    public ListaCompraMenu(Console console, ListaCompraService listaService) {
        super(console);
        this.listaService = listaService;
    }

    @Override
    protected String titulo() {
        return "LISTAS DE COMPRAS (MODO MISSÃO)";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Listar todas as listas",
            "2 - Listas de um cliente",
            "3 - Ver itens de uma lista",
            "4 - Criar lista",
            "5 - Renomear lista",
            "6 - Excluir lista",
            "7 - Adicionar produto / mudar quantidade",
            "8 - Marcar item como coletado",
            "9 - Remover item",
            "10 - Calcular rota na loja"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> console.imprimirLista("Listas de compras", listaService.listar());
            case 2 -> console.imprimirLista("Listas do cliente",
                    listaService.listarPorCliente(console.lerId("Id do cliente")));
            case 3 -> mostrarItens(listaService.buscarPorId(console.lerId("Id da lista")));
            case 4 -> criar();
            case 5 -> renomear();
            case 6 -> excluir();
            case 7 -> adicionarItem();
            case 8 -> marcarColetado();
            case 9 -> removerItem();
            case 10 -> calcularRota();
            default -> console.erro("Opção inválida.");
        }
    }

    private void criar() {
        long idCliente = console.lerId("Id do cliente");
        ListaCompra lista = listaService.criar(idCliente, console.lerTexto("Nome da lista"));
        console.sucesso("Lista criada com id " + lista.getId() + ". Use a opção 7 para adicionar produtos.");
    }

    private void renomear() {
        long id = console.lerId("Id da lista");
        listaService.renomear(id, console.lerTexto("Novo nome"));
        console.sucesso("Lista renomeada.");
    }

    private void excluir() {
        ListaCompra lista = listaService.buscarPorId(console.lerId("Id da lista"));
        if (console.lerSimNao("Excluir a lista " + lista.getNome() + " e os itens dela?")) {
            listaService.excluir(lista.getId());
            console.sucesso("Lista excluída.");
        }
    }

    private void adicionarItem() {
        long idLista = console.lerId("Id da lista");
        long idProduto = console.lerId("Id do produto");
        int quantidade = console.lerInteiro("Quantidade");
        mostrarItens(listaService.adicionarItem(idLista, idProduto, quantidade));
    }

    private void marcarColetado() {
        long idLista = console.lerId("Id da lista");
        long idProduto = console.lerId("Id do produto");
        boolean coletado = console.lerSimNao("Já está no carrinho?");
        mostrarItens(listaService.marcarColetado(idLista, idProduto, coletado));
    }

    private void removerItem() {
        long idLista = console.lerId("Id da lista");
        long idProduto = console.lerId("Id do produto");
        mostrarItens(listaService.removerItem(idLista, idProduto));
    }

    private void calcularRota() {
        long idLista = console.lerId("Id da lista");
        String corredor = console.lerTexto("Corredor onde você está (placa QR) ou Enter para começar da entrada");
        List<ItemLista> rota = listaService.calcularRota(idLista, corredor);

        System.out.println();
        System.out.println("--- Rota sugerida ---");
        if (rota.isEmpty()) {
            System.out.println("Todos os itens já foram coletados. Bom trabalho!");
        }
        for (int i = 0; i < rota.size(); i++) {
            ItemLista item = rota.get(i);
            System.out.printf("%d. %s - %dx %s%s%n", i + 1, item.getProduto().getLocalizacao(),
                    item.getQuantidade(), item.getProduto().getNome(),
                    item.getProduto().isEmRuptura() ? "  (sem estoque: use \"Não achei\")" : "");
        }
    }

    private void mostrarItens(ListaCompra lista) {
        System.out.println();
        System.out.println(lista);
        if (lista.getItens().isEmpty()) {
            System.out.println("  (lista vazia)");
        }
        for (ItemLista item : lista.getItens()) {
            System.out.printf("  produto #%d %s | R$ %.2f%n", item.getProduto().getId(), item, item.getSubtotal());
        }
    }
}
