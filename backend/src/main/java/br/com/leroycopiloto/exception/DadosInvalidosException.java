package br.com.leroycopiloto.exception;

/**
 * Entrada que não passou na validação (campo vazio, formato errado, valor
 * negativo...). Lançada pela camada service antes de chegar no banco.
 */
public class DadosInvalidosException extends SistemaException {

    public DadosInvalidosException(String mensagem) {
        super(mensagem);
    }
}
