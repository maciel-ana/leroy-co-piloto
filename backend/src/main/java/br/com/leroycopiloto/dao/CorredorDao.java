package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Setor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_CORREDOR. Toda leitura já traz o setor junto (JOIN).
 */
public class CorredorDao implements Dao<Corredor> {

    private static final String SELECT_BASE =
            "SELECT c.id_corredor, c.codigo AS corredor_codigo, c.pos_x, c.pos_y, c.largura, c.altura, "
          + "       s.id_setor, s.codigo AS setor_codigo, s.nome AS setor_nome "
          + "  FROM LCP_CORREDOR c "
          + "  JOIN LCP_SETOR s ON s.id_setor = c.id_setor ";

    /**
     * Monta um corredor a partir das colunas com os apelidos usados nas
     * consultas (corredor_codigo, setor_codigo, setor_nome). Também é usado
     * pelos DAOs de produto e vendedor, que fazem o mesmo JOIN.
     */
    static Corredor mapear(ResultSet rs) throws SQLException {
        Setor setor = new Setor(rs.getLong("id_setor"), rs.getString("setor_codigo"), rs.getString("setor_nome"));
        return new Corredor(rs.getLong("id_corredor"), rs.getString("corredor_codigo"), setor,
                rs.getInt("pos_x"), rs.getInt("pos_y"), rs.getInt("largura"), rs.getInt("altura"));
    }

    @Override
    public Corredor inserir(Corredor corredor) {
        String sql = "INSERT INTO LCP_CORREDOR (codigo, id_setor, pos_x, pos_y, largura, altura) "
                   + "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_CORREDOR"})) {
            preencher(stmt, corredor);
            stmt.executeUpdate();
            corredor.setId(JdbcUtil.lerIdGerado(stmt));
            return corredor;
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar o corredor", e);
        }
    }

    @Override
    public List<Corredor> listar() {
        List<Corredor> corredores = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "ORDER BY c.codigo");
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                corredores.add(mapear(rs));
            }
            return corredores;
        } catch (SQLException e) {
            throw PersistenciaException.de("listar os corredores", e);
        }
    }

    @Override
    public Optional<Corredor> buscarPorId(long id) {
        return buscarUm(SELECT_BASE + "WHERE c.id_corredor = ?", id);
    }

    /** Busca pelo código impresso na placa QR (ex.: A03). */
    public Optional<Corredor> buscarPorCodigo(String codigo) {
        return buscarUm(SELECT_BASE + "WHERE c.codigo = ?", codigo);
    }

    private Optional<Corredor> buscarUm(String sql, Object parametro) {
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, parametro);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw PersistenciaException.de("buscar o corredor", e);
        }
    }

    @Override
    public boolean atualizar(Corredor corredor) {
        String sql = "UPDATE LCP_CORREDOR SET codigo = ?, id_setor = ?, pos_x = ?, pos_y = ?, largura = ?, altura = ? "
                   + "WHERE id_corredor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            preencher(stmt, corredor);
            stmt.setLong(7, corredor.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o corredor", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_CORREDOR WHERE id_corredor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o corredor", e);
        }
    }

    private void preencher(PreparedStatement stmt, Corredor corredor) throws SQLException {
        stmt.setString(1, corredor.getCodigo());
        stmt.setLong(2, corredor.getSetor().getId());
        stmt.setInt(3, corredor.getPosX());
        stmt.setInt(4, corredor.getPosY());
        stmt.setInt(5, corredor.getLargura());
        stmt.setInt(6, corredor.getAltura());
    }
}
