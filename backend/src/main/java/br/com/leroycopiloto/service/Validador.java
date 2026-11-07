package br.com.leroycopiloto.service;

import br.com.leroycopiloto.exception.DadosInvalidosException;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Validações de entrada usadas pelos services. Cada método devolve o valor já
 * limpo (sem espaços nas pontas) ou lança {@link DadosInvalidosException}
 * dizendo qual campo está errado e por quê.
 */
final class Validador {

    private static final Pattern EMAIL = Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");
    private static final Pattern TELEFONE = Pattern.compile("^[0-9()+\\- ]{8,20}$");

    private Validador() {
    }

    static String obrigatorio(String valor, String campo, int tamanhoMaximo) {
        if (valor == null || valor.isBlank()) {
            throw new DadosInvalidosException("O campo " + campo + " é obrigatório.");
        }
        return opcional(valor, campo, tamanhoMaximo);
    }

    /** Campo que pode ficar vazio; vazio vira null para gravar NULL no banco. */
    static String opcional(String valor, String campo, int tamanhoMaximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String limpo = valor.trim();
        if (limpo.length() > tamanhoMaximo) {
            throw new DadosInvalidosException("O campo " + campo + " aceita no máximo " + tamanhoMaximo + " caracteres.");
        }
        return limpo;
    }

    static String formato(String valor, String campo, Pattern padrao, String exemplo) {
        String limpo = obrigatorio(valor, campo, 120).toUpperCase();
        if (!padrao.matcher(limpo).matches()) {
            throw new DadosInvalidosException("O campo " + campo + " deve seguir o formato " + exemplo + ".");
        }
        return limpo;
    }

    static String email(String valor) {
        String limpo = obrigatorio(valor, "e-mail", 120).toLowerCase();
        if (!EMAIL.matcher(limpo).matches()) {
            throw new DadosInvalidosException("E-mail inválido: " + valor);
        }
        return limpo;
    }

    static String telefone(String valor) {
        String limpo = opcional(valor, "telefone", 20);
        if (limpo != null && !TELEFONE.matcher(limpo).matches()) {
            throw new DadosInvalidosException("Telefone inválido. Use só números, espaço, parênteses e hífen.");
        }
        return limpo;
    }

    static <T> T naoNulo(T valor, String campo) {
        if (valor == null) {
            throw new DadosInvalidosException("O campo " + campo + " é obrigatório.");
        }
        return valor;
    }

    static int intervalo(int valor, String campo, int minimo, int maximo) {
        if (valor < minimo || valor > maximo) {
            throw new DadosInvalidosException("O campo " + campo + " deve estar entre " + minimo + " e " + maximo + ".");
        }
        return valor;
    }

    static BigDecimal naoNegativo(BigDecimal valor, String campo) {
        naoNulo(valor, campo);
        if (valor.signum() < 0) {
            throw new DadosInvalidosException("O campo " + campo + " não pode ser negativo.");
        }
        if (valor.scale() > 2) {
            throw new DadosInvalidosException("O campo " + campo + " aceita no máximo 2 casas decimais.");
        }
        return valor;
    }
}
