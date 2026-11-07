package br.com.leroycopiloto.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;

/**
 * Pequenas conversões repetidas entre Java e JDBC usadas pelos DAOs.
 */
final class JdbcUtil {

    private JdbcUtil() {
    }

    /** Lê o id que o IDENTITY gerou no último INSERT. */
    static long lerIdGerado(PreparedStatement stmt) throws SQLException {
        try (ResultSet chaves = stmt.getGeneratedKeys()) {
            if (!chaves.next()) {
                throw new SQLException("O banco não devolveu o id gerado.");
            }
            return chaves.getLong(1);
        }
    }

    static void setLongOuNulo(PreparedStatement stmt, int indice, Long valor) throws SQLException {
        if (valor == null) {
            stmt.setNull(indice, Types.NUMERIC);
        } else {
            stmt.setLong(indice, valor);
        }
    }

    static void setDataHoraOuNula(PreparedStatement stmt, int indice, LocalDateTime valor) throws SQLException {
        if (valor == null) {
            stmt.setNull(indice, Types.TIMESTAMP);
        } else {
            stmt.setTimestamp(indice, Timestamp.valueOf(valor));
        }
    }

    static LocalDateTime getDataHora(ResultSet rs, String coluna) throws SQLException {
        Timestamp valor = rs.getTimestamp(coluna);
        return valor == null ? null : valor.toLocalDateTime();
    }

    /** Lê um NUMBER que pode ser NULL sem transformá-lo em 0. */
    static Long getLongOuNulo(ResultSet rs, String coluna) throws SQLException {
        long valor = rs.getLong(coluna);
        return rs.wasNull() ? null : valor;
    }
}
