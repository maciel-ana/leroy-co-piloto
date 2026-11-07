package br.com.leroycopiloto.model;

import java.math.BigDecimal;

/**
 * Uma linha de relatório gerado por SQL com JOIN e GROUP BY: um rótulo
 * (setor, vendedor, produto...), uma contagem e, quando faz sentido, um valor.
 */
public class LinhaRelatorio {

    private final String rotulo;
    private final long quantidade;
    private final BigDecimal valor;

    public LinhaRelatorio(String rotulo, long quantidade, BigDecimal valor) {
        this.rotulo = rotulo;
        this.quantidade = quantidade;
        this.valor = valor;
    }

    public String getRotulo() {
        return rotulo;
    }

    public long getQuantidade() {
        return quantidade;
    }

    public BigDecimal getValor() {
        return valor;
    }

    @Override
    public String toString() {
        String rotuloCurto = rotulo.length() > 45 ? rotulo.substring(0, 42) + "..." : rotulo;
        String texto = String.format("%-45s %5d", rotuloCurto, quantidade);
        return valor == null ? texto : texto + String.format("   %10.2f", valor);
    }
}
