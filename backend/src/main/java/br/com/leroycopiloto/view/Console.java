package br.com.leroycopiloto.view;

import br.com.leroycopiloto.exception.EntradaEncerradaException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Scanner;

/**
 * Leitura do teclado com validação de tipo. Número digitado errado não
 * derruba o programa: a pergunta é repetida com uma explicação.
 */
public class Console {

    private final Scanner scanner;

    public Console(Scanner scanner) {
        this.scanner = scanner;
    }

    public String lerTexto(String rotulo) {
        System.out.print(rotulo + ": ");
        if (!scanner.hasNextLine()) {
            throw new EntradaEncerradaException();
        }
        return scanner.nextLine().trim();
    }

    /** Para edição: Enter sem digitar nada mantém o valor atual. */
    public String lerTexto(String rotulo, String valorAtual) {
        String digitado = lerTexto(rotulo + " [" + (valorAtual == null ? "" : valorAtual) + "]");
        return digitado.isEmpty() ? valorAtual : digitado;
    }

    public int lerInteiro(String rotulo) {
        while (true) {
            String digitado = lerTexto(rotulo);
            try {
                return Integer.parseInt(digitado);
            } catch (NumberFormatException e) {
                System.out.println("  Digite um número inteiro.");
            }
        }
    }

    public int lerInteiro(String rotulo, int valorAtual) {
        while (true) {
            String digitado = lerTexto(rotulo + " [" + valorAtual + "]");
            if (digitado.isEmpty()) {
                return valorAtual;
            }
            try {
                return Integer.parseInt(digitado);
            } catch (NumberFormatException e) {
                System.out.println("  Digite um número inteiro.");
            }
        }
    }

    public long lerId(String rotulo) {
        while (true) {
            String digitado = lerTexto(rotulo);
            try {
                return Long.parseLong(digitado);
            } catch (NumberFormatException e) {
                System.out.println("  Digite o número do id (ex.: 3).");
            }
        }
    }

    /** Aceita vírgula ou ponto como separador decimal. */
    public BigDecimal lerValor(String rotulo, BigDecimal valorAtual) {
        while (true) {
            String digitado = valorAtual == null ? lerTexto(rotulo) : lerTexto(rotulo + " [" + valorAtual + "]");
            if (digitado.isEmpty() && valorAtual != null) {
                return valorAtual;
            }
            try {
                return new BigDecimal(digitado.replace(',', '.'));
            } catch (NumberFormatException e) {
                System.out.println("  Digite um valor numérico (ex.: 39,90).");
            }
        }
    }

    public boolean lerSimNao(String pergunta) {
        while (true) {
            String digitado = lerTexto(pergunta + " (s/n)").toLowerCase();
            if (digitado.equals("s") || digitado.equals("sim")) {
                return true;
            }
            if (digitado.equals("n") || digitado.equals("nao") || digitado.equals("não")) {
                return false;
            }
            System.out.println("  Responda s ou n.");
        }
    }

    /**
     * Mostra as opções de um enum numeradas e devolve a escolhida.
     *
     * @param valorAtual opção atual (Enter mantém), ou null quando é obrigatório escolher
     */
    public <E extends Enum<E>> E escolher(String rotulo, Class<E> tipo, E valorAtual) {
        E[] opcoes = tipo.getEnumConstants();
        System.out.println(rotulo + ":");
        for (int i = 0; i < opcoes.length; i++) {
            System.out.printf("  %d - %s%n", i + 1, opcoes[i]);
        }
        while (true) {
            String digitado = valorAtual == null ? lerTexto("Opção") : lerTexto("Opção [" + valorAtual + "]");
            if (digitado.isEmpty() && valorAtual != null) {
                return valorAtual;
            }
            try {
                int indice = Integer.parseInt(digitado);
                if (indice >= 1 && indice <= opcoes.length) {
                    return opcoes[indice - 1];
                }
            } catch (NumberFormatException e) {
                // cai na mensagem abaixo
            }
            System.out.println("  Escolha um número de 1 a " + opcoes.length + ".");
        }
    }

    public void imprimirLista(String titulo, List<?> itens) {
        System.out.println();
        System.out.println("--- " + titulo + " ---");
        if (itens.isEmpty()) {
            System.out.println("(nenhum registro)");
        }
        for (Object item : itens) {
            System.out.println(item);
        }
    }

    public void sucesso(String mensagem) {
        System.out.println(">> " + mensagem);
    }

    public void erro(String mensagem) {
        System.out.println("!! " + mensagem);
    }
}
