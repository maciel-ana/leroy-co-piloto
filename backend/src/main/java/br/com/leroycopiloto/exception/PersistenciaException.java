package br.com.leroycopiloto.exception;

import java.sql.SQLException;

/**
 * Falha ao falar com o banco. Os DAOs nunca deixam escapar uma
 * {@link SQLException}: eles a convertem aqui numa mensagem clara, guardando
 * a exceção original como causa.
 *
 * <p>A tradução olha o código de erro do Oracle (ORA-xxxxx) e, como reserva,
 * o SQLSTATE padrão, que outros bancos relacionais também usam.</p>
 */
public class PersistenciaException extends SistemaException {

    public PersistenciaException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }

    /**
     * @param acao o que se tentava fazer, no infinitivo (ex.: "cadastrar o produto")
     * @param e    exceção devolvida pelo driver JDBC
     */
    public static PersistenciaException de(String acao, SQLException e) {
        return new PersistenciaException("Não foi possível " + acao + ": " + motivo(e), e);
    }

    private static String motivo(SQLException e) {
        int codigo = e.getErrorCode();
        String estado = e.getSQLState() == null ? "" : e.getSQLState();

        if (codigo == 1 || estado.equals("23505")) {
            return "já existe um cadastro com esse valor (SKU, e-mail ou matrícula repetido).";
        }
        if (codigo == 2292 || codigo == 23503) {
            return "o registro está ligado a outros dados (chamados, listas ou produtos) e não pode ser excluído.";
        }
        if (codigo == 2291 || codigo == 23506) {
            return "o registro relacionado não existe (corredor, cliente, produto ou vendedor).";
        }
        if (codigo == 2290 || estado.equals("23513")) {
            return "um dos valores está fora das regras do banco.";
        }
        if (codigo == 1400 || estado.equals("23502")) {
            return "um campo obrigatório ficou vazio.";
        }
        if (codigo == 12899 || estado.equals("22001")) {
            return "um dos textos passou do tamanho permitido.";
        }
        if (codigo == 942 || codigo == 42102 || estado.equals("42S02")) {
            return "as tabelas não existem. Rode o script sql/leroy_co_piloto.sql antes de usar o sistema.";
        }
        if (codigo == 1017 || estado.equals("28000")) {
            return "usuário ou senha do banco inválidos. Confira o arquivo db.properties.";
        }
        if (e.getMessage() != null && e.getMessage().contains("No suitable driver")) {
            return "o driver JDBC não está no classpath. Rode o projeto pelo Maven ou pela IDE (veja o README).";
        }
        if (codigo == 17002 || codigo == 17868 || estado.startsWith("08")) {
            return "sem conexão com o banco. Verifique a internet e a URL no db.properties.";
        }
        return "erro no banco de dados (" + e.getMessage() + ").";
    }
}
