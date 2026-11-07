package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Produto;
import br.com.leroycopiloto.model.enums.Categoria;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_PRODUTO. Toda leitura já traz o corredor e o setor (JOIN).
 */
public class ProdutoDao implements Dao<Produto> {

    /** Colunas e JOINs do produto, reaproveitados pelo DAO de listas. */
    static final String COLUNAS =
            "p.id_produto, p.sku, p.nome, p.marca, p.categoria, p.preco, p.estoque, "
          + "p.modulo_gondola, p.prateleira, p.ordem_corredor, "
          + "c.id_corredor, c.codigo AS corredor_codigo, c.pos_x, c.pos_y, c.largura, c.altura, "
          + "s.id_setor, s.codigo AS setor_codigo, s.nome AS setor_nome ";

    static final String JOINS =
            "  JOIN LCP_CORREDOR c ON c.id_corredor = p.id_corredor "
          + "  JOIN LCP_SETOR s ON s.id_setor = c.id_setor ";

    private static final String SELECT_BASE = "SELECT " + COLUNAS + "FROM LCP_PRODUTO p " + JOINS;

    static Produto mapear(ResultSet rs) throws SQLException {
        return new Produto(
                rs.getLong("id_produto"),
                rs.getString("sku"),
                rs.getString("nome"),
                rs.getString("marca"),
                Categoria.valueOf(rs.getString("categoria")),
                rs.getBigDecimal("preco"),
                rs.getInt("estoque"),
                CorredorDao.mapear(rs),
                rs.getString("modulo_gondola"),
                rs.getString("prateleira"),
                rs.getInt("ordem_corredor"));
    }

    @Override
    public Produto inserir(Produto produto) {
        String sql = "INSERT INTO LCP_PRODUTO (sku, nome, marca, categoria, preco, estoque, id_corredor, "
                   + "modulo_gondola, prateleira, ordem_corredor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_PRODUTO"})) {
            preencher(stmt, produto);
            stmt.executeUpdate();
            produto.setId(JdbcUtil.lerIdGerado(stmt));
            return produto;
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar o produto", e);
        }
    }

    @Override
    public List<Produto> listar() {
        return consultar(SELECT_BASE + "ORDER BY p.ordem_corredor, p.nome", null);
    }

    /** Pesquisa pelo nome, sem diferenciar maiúsculas de minúsculas. */
    public List<Produto> buscarPorNome(String trecho) {
        return consultar(SELECT_BASE + "WHERE UPPER(p.nome) LIKE UPPER(?) ORDER BY p.ordem_corredor, p.nome",
                "%" + trecho + "%");
    }

    @Override
    public Optional<Produto> buscarPorId(long id) {
        return consultar(SELECT_BASE + "WHERE p.id_produto = ?", id).stream().findFirst();
    }

    public Optional<Produto> buscarPorSku(String sku) {
        return consultar(SELECT_BASE + "WHERE p.sku = ?", sku).stream().findFirst();
    }

    private List<Produto> consultar(String sql, Object parametro) {
        List<Produto> produtos = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            if (parametro != null) {
                stmt.setObject(1, parametro);
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    produtos.add(mapear(rs));
                }
            }
            return produtos;
        } catch (SQLException e) {
            throw PersistenciaException.de("consultar os produtos", e);
        }
    }

    @Override
    public boolean atualizar(Produto produto) {
        String sql = "UPDATE LCP_PRODUTO SET sku = ?, nome = ?, marca = ?, categoria = ?, preco = ?, estoque = ?, "
                   + "id_corredor = ?, modulo_gondola = ?, prateleira = ?, ordem_corredor = ? WHERE id_produto = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            preencher(stmt, produto);
            stmt.setLong(11, produto.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o produto", e);
        }
    }

    /** Muda só o estoque (reposição ou ruptura confirmada pelo vendedor). */
    public boolean atualizarEstoque(long idProduto, int estoque) {
        String sql = "UPDATE LCP_PRODUTO SET estoque = ? WHERE id_produto = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, estoque);
            stmt.setLong(2, idProduto);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o estoque", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_PRODUTO WHERE id_produto = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o produto", e);
        }
    }

    private void preencher(PreparedStatement stmt, Produto produto) throws SQLException {
        stmt.setString(1, produto.getSku());
        stmt.setString(2, produto.getNome());
        stmt.setString(3, produto.getMarca());
        stmt.setString(4, produto.getCategoria().name());
        stmt.setBigDecimal(5, produto.getPreco());
        stmt.setInt(6, produto.getEstoque());
        stmt.setLong(7, produto.getCorredor().getId());
        stmt.setString(8, produto.getModuloGondola());
        stmt.setString(9, produto.getPrateleira());
        stmt.setInt(10, produto.getOrdemCorredor());
    }
}
