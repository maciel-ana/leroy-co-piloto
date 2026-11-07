package br.com.leroycopiloto.exception;

/**
 * Operação que os dados permitem, mas a regra de negócio não
 * (ex.: mudar o status de um chamado que já foi encerrado).
 */
public class OperacaoInvalidaException extends SistemaException {

    public OperacaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
