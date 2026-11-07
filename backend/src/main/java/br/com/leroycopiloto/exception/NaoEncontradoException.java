package br.com.leroycopiloto.exception;

/**
 * Busca por um registro que não existe no banco (id, SKU, código de corredor...).
 */
public class NaoEncontradoException extends SistemaException {

    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
