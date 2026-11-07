package br.com.leroycopiloto.view;

import br.com.leroycopiloto.exception.EntradaEncerradaException;
import br.com.leroycopiloto.exception.SistemaException;

/**
 * Laço padrão de todos os menus: mostra as opções, lê a escolha e executa.
 *
 * <p>É aqui que os erros são tratados. Qualquer {@link SistemaException}
 * (dado inválido, registro inexistente, falha no banco) vira uma mensagem na
 * tela e o menu continua de pé.</p>
 */
public abstract class Menu {

    protected final Console console;

    protected Menu(Console console) {
        this.console = console;
    }

    protected abstract String titulo();

    /** Opções no formato "1 - Listar"; a opção 0 (voltar/sair) é adicionada sozinha. */
    protected abstract String[] opcoes();

    /** Executa a opção escolhida. Só é chamado para opções diferentes de 0. */
    protected abstract void executar(int opcao);

    protected String textoOpcaoZero() {
        return "0 - Voltar";
    }

    public void abrir() {
        while (true) {
            System.out.println();
            System.out.println("=== " + titulo() + " ===");
            for (String opcao : opcoes()) {
                System.out.println(opcao);
            }
            System.out.println(textoOpcaoZero());

            int escolha = console.lerInteiro("Escolha");
            if (escolha == 0) {
                return;
            }
            if (escolha < 0 || escolha > opcoes().length) {
                console.erro("Opção inválida.");
                continue;
            }

            try {
                executar(escolha);
            } catch (SistemaException e) {
                console.erro(e.getMessage());
            } catch (EntradaEncerradaException e) {
                throw e;
            } catch (RuntimeException e) {
                console.erro("Erro inesperado: " + e.getMessage());
            }
        }
    }
}
