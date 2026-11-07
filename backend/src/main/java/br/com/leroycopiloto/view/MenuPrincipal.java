package br.com.leroycopiloto.view;

/**
 * Menu de entrada do sistema. Cada opção abre o menu de uma área.
 */
public class MenuPrincipal extends Menu {

    private final Menu[] submenus;

    /**
     * @param submenus na mesma ordem das opções 1, 2, 3...
     */
    public MenuPrincipal(Console console, Menu... submenus) {
        super(console);
        this.submenus = submenus;
    }

    @Override
    protected String titulo() {
        return "LEROY CO-PILOTO";
    }

    @Override
    protected String[] opcoes() {
        String[] opcoes = new String[submenus.length];
        for (int i = 0; i < submenus.length; i++) {
            opcoes[i] = (i + 1) + " - " + submenus[i].titulo();
        }
        return opcoes;
    }

    @Override
    protected String textoOpcaoZero() {
        return "0 - Sair";
    }

    @Override
    protected void executar(int opcao) {
        submenus[opcao - 1].abrir();
    }
}
