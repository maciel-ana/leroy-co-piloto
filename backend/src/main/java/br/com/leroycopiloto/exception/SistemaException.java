package br.com.leroycopiloto.exception;

/**
 * Base dos erros esperados do sistema. A mensagem é sempre pensada para ser
 * mostrada direto ao usuário, então a interface só precisa capturar esta
 * classe para tratar qualquer um deles sem derrubar o programa.
 */
public class SistemaException extends RuntimeException {

    public SistemaException(String mensagem) {
        super(mensagem);
    }

    public SistemaException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
