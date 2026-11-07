package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Abre conexões JDBC com o banco configurado em {@link DatabaseConfig}.
 * Quem chama fecha a conexão, de preferência com try-with-resources.
 */
public final class ConnectionFactory {

    private ConnectionFactory() {
        // Classe utilitária, não deve ser instanciada.
    }

    public static Connection getConnection() throws SQLException {
        DatabaseConfig config = DatabaseConfig.carregar();
        return DriverManager.getConnection(config.getUrl(), config.getUsuario(), config.getSenha());
    }

    /**
     * Confere se dá para conectar e se as tabelas do script já existem.
     *
     * @throws PersistenciaException com a explicação do problema
     */
    public static void verificarConexao() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM LCP_SETOR")) {
            rs.next();
        } catch (SQLException e) {
            throw PersistenciaException.de("acessar o banco", e);
        }
    }
}
