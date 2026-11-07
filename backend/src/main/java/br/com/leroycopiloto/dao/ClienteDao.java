package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Cliente;
import br.com.leroycopiloto.model.enums.PerfilProjeto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_CLIENTE.
 */
public class ClienteDao implements Dao<Cliente> {

    private static final String SELECT_BASE =
            "SELECT id_cliente, nome, email, telefone, perfil_projeto FROM LCP_CLIENTE ";

    private static Cliente mapear(ResultSet rs) throws SQLException {
        return new Cliente(rs.getLong("id_cliente"), rs.getString("nome"), rs.getString("telefone"),
                rs.getString("email"), PerfilProjeto.valueOf(rs.getString("perfil_projeto")));
    }

    @Override
    public Cliente inserir(Cliente cliente) {
        String sql = "INSERT INTO LCP_CLIENTE (nome, email, telefone, perfil_projeto) VALUES (?, ?, ?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_CLIENTE"})) {
            preencher(stmt, cliente);
            stmt.executeUpdate();
            cliente.setId(JdbcUtil.lerIdGerado(stmt));
            return cliente;
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar o cliente", e);
        }
    }

    @Override
    public List<Cliente> listar() {
        List<Cliente> clientes = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "ORDER BY nome");
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                clientes.add(mapear(rs));
            }
            return clientes;
        } catch (SQLException e) {
            throw PersistenciaException.de("listar os clientes", e);
        }
    }

    @Override
    public Optional<Cliente> buscarPorId(long id) {
        return buscarUm(SELECT_BASE + "WHERE id_cliente = ?", id);
    }

    public Optional<Cliente> buscarPorEmail(String email) {
        return buscarUm(SELECT_BASE + "WHERE LOWER(email) = LOWER(?)", email);
    }

    private Optional<Cliente> buscarUm(String sql, Object parametro) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, parametro);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw PersistenciaException.de("buscar o cliente", e);
        }
    }

    @Override
    public boolean atualizar(Cliente cliente) {
        String sql = "UPDATE LCP_CLIENTE SET nome = ?, email = ?, telefone = ?, perfil_projeto = ? WHERE id_cliente = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            preencher(stmt, cliente);
            stmt.setLong(5, cliente.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o cliente", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_CLIENTE WHERE id_cliente = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o cliente", e);
        }
    }

    private void preencher(PreparedStatement stmt, Cliente cliente) throws SQLException {
        stmt.setString(1, cliente.getNome());
        stmt.setString(2, cliente.getEmail());
        stmt.setString(3, cliente.getTelefone());
        stmt.setString(4, cliente.getPerfilProjeto().name());
    }
}
