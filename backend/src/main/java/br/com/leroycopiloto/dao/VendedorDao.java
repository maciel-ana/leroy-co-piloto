package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Vendedor;
import br.com.leroycopiloto.model.enums.Categoria;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_VENDEDOR. O corredor atual vem por LEFT JOIN, porque o
 * vendedor pode estar sem posição registrada.
 */
public class VendedorDao implements Dao<Vendedor> {

    private static final String SELECT_BASE =
            "SELECT v.id_vendedor, v.matricula, v.nome, v.telefone, v.especialidade, v.disponivel, "
          + "       c.id_corredor, c.codigo AS corredor_codigo, c.pos_x, c.pos_y, c.largura, c.altura, "
          + "       s.id_setor, s.codigo AS setor_codigo, s.nome AS setor_nome "
          + "  FROM LCP_VENDEDOR v "
          + "  LEFT JOIN LCP_CORREDOR c ON c.id_corredor = v.id_corredor_atual "
          + "  LEFT JOIN LCP_SETOR s ON s.id_setor = c.id_setor ";

    private static Vendedor mapear(ResultSet rs) throws SQLException {
        Corredor corredor = JdbcUtil.getLongOuNulo(rs, "id_corredor") == null ? null : CorredorDao.mapear(rs);
        return new Vendedor(rs.getLong("id_vendedor"), rs.getString("nome"), rs.getString("telefone"),
                rs.getString("matricula"), Categoria.valueOf(rs.getString("especialidade")),
                corredor, rs.getInt("disponivel") == 1);
    }

    @Override
    public Vendedor inserir(Vendedor vendedor) {
        String sql = "INSERT INTO LCP_VENDEDOR (matricula, nome, telefone, especialidade, id_corredor_atual, disponivel) "
                   + "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_VENDEDOR"})) {
            preencher(stmt, vendedor);
            stmt.executeUpdate();
            vendedor.setId(JdbcUtil.lerIdGerado(stmt));
            return vendedor;
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar o vendedor", e);
        }
    }

    @Override
    public List<Vendedor> listar() {
        return consultar(SELECT_BASE + "ORDER BY v.nome", null);
    }

    public List<Vendedor> listarDisponiveis() {
        return consultar(SELECT_BASE + "WHERE v.disponivel = 1 ORDER BY v.nome", null);
    }

    @Override
    public Optional<Vendedor> buscarPorId(long id) {
        return consultar(SELECT_BASE + "WHERE v.id_vendedor = ?", id).stream().findFirst();
    }

    public Optional<Vendedor> buscarPorMatricula(String matricula) {
        return consultar(SELECT_BASE + "WHERE v.matricula = ?", matricula).stream().findFirst();
    }

    private List<Vendedor> consultar(String sql, Object parametro) {
        List<Vendedor> vendedores = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            if (parametro != null) {
                stmt.setObject(1, parametro);
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    vendedores.add(mapear(rs));
                }
            }
            return vendedores;
        } catch (SQLException e) {
            throw PersistenciaException.de("consultar os vendedores", e);
        }
    }

    @Override
    public boolean atualizar(Vendedor vendedor) {
        String sql = "UPDATE LCP_VENDEDOR SET matricula = ?, nome = ?, telefone = ?, especialidade = ?, "
                   + "id_corredor_atual = ?, disponivel = ? WHERE id_vendedor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            preencher(stmt, vendedor);
            stmt.setLong(7, vendedor.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o vendedor", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_VENDEDOR WHERE id_vendedor = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o vendedor", e);
        }
    }

    private void preencher(PreparedStatement stmt, Vendedor vendedor) throws SQLException {
        stmt.setString(1, vendedor.getMatricula());
        stmt.setString(2, vendedor.getNome());
        stmt.setString(3, vendedor.getTelefone());
        stmt.setString(4, vendedor.getEspecialidade().name());
        JdbcUtil.setLongOuNulo(stmt, 5, vendedor.getCorredorAtual() == null ? null : vendedor.getCorredorAtual().getId());
        stmt.setInt(6, vendedor.isDisponivel() ? 1 : 0);
    }
}
