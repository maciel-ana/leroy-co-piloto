package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.service.LojaService;

/**
 * Consulta da planta da loja: setores e corredores.
 */
public class LojaMenu extends Menu {

    private final LojaService lojaService;

    public LojaMenu(Console console, LojaService lojaService) {
        super(console);
        this.lojaService = lojaService;
    }

    @Override
    protected String titulo() {
        return "MAPA DA LOJA";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Listar setores",
            "2 - Listar corredores",
            "3 - Distância entre dois corredores"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> console.imprimirLista("Setores", lojaService.listarSetores());
            case 2 -> console.imprimirLista("Corredores", lojaService.listarCorredores());
            case 3 -> distancia();
            default -> console.erro("Opção inválida.");
        }
    }

    private void distancia() {
        Corredor origem = lojaService.buscarCorredor(console.lerTexto("Corredor de origem"));
        Corredor destino = lojaService.buscarCorredor(console.lerTexto("Corredor de destino"));
        console.sucesso(String.format("De %s até %s: %.0f unidades do mapa.",
                origem.getCodigo(), destino.getCodigo(), origem.distanciaAte(destino)));
    }
}
