package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Setor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_SETOR.
 */
public class SetorDao implements Dao<Setor> {

    @Override
    public Setor inserir(Setor setor) {
        String sql = "INSERT INTO LCP_SETOR (codigo, nome) VALUES (?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_SETOR"})) {
            stmt.setString(1, setor.getCodigo());
            stmt.setString(2, setor.getNome());
            stmt.executeUpdate();
            setor.setId(JdbcUtil.lerIdGerado(stmt));
            return setor;
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar o setor", e);
        }
    }

    @Override
    public List<Setor> listar() {
        String sql = "SELECT id_setor, codigo, nome FROM LCP_SETOR ORDER BY codigo";
        List<Setor> setores = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                setores.add(new Setor(rs.getLong("id_setor"), rs.getString("codigo"), rs.getString("nome")));
            }
            return setores;
        } catch (SQLException e) {
            throw PersistenciaException.de("listar os setores", e);
        }
    }

    @Override
    public Optional<Setor> buscarPorId(long id) {
        String sql = "SELECT id_setor, codigo, nome FROM LCP_SETOR WHERE id_setor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Setor(rs.getLong("id_setor"), rs.getString("codigo"), rs.getString("nome")));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw PersistenciaException.de("buscar o setor", e);
        }
    }

    @Override
    public boolean atualizar(Setor setor) {
        String sql = "UPDATE LCP_SETOR SET codigo = ?, nome = ? WHERE id_setor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, setor.getCodigo());
            stmt.setString(2, setor.getNome());
            stmt.setLong(3, setor.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o setor", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_SETOR WHERE id_setor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o setor", e);
        }
    }
}
