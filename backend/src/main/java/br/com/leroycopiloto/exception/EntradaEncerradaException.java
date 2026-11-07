package br.com.leroycopiloto.exception;

/**
 * O console não tem mais linhas para ler (ex.: Ctrl+Z / Ctrl+D ou entrada
 * redirecionada que acabou). Sinaliza para o programa terminar com calma.
 */
public class EntradaEncerradaException extends RuntimeException {

    public EntradaEncerradaException() {
        super("Entrada do console encerrada.");
    }
}
