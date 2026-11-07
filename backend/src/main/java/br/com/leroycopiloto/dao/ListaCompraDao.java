package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.Cliente;
import br.com.leroycopiloto.model.ItemLista;
import br.com.leroycopiloto.model.ListaCompra;
import br.com.leroycopiloto.model.enums.PerfilProjeto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_LISTA_COMPRA e dos itens na tabela associativa
 * LCP_ITEM_LISTA (o N:N entre lista e produto).
 */
public class ListaCompraDao implements Dao<ListaCompra> {

    private static final String SELECT_BASE =
            "SELECT l.id_lista, l.nome AS lista_nome, l.data_criacao, "
          + "       cl.id_cliente, cl.nome AS cliente_nome, cl.email, cl.telefone, cl.perfil_projeto "
          + "  FROM LCP_LISTA_COMPRA l "
          + "  JOIN LCP_CLIENTE cl ON cl.id_cliente = l.id_cliente ";

    private static final String SELECT_ITENS =
            "SELECT i.quantidade, i.coletado, " + ProdutoDao.COLUNAS
          + "  FROM LCP_ITEM_LISTA i "
          + "  JOIN LCP_PRODUTO p ON p.id_produto = i.id_produto "
          + ProdutoDao.JOINS
          + " WHERE i.id_lista = ? "
          + " ORDER BY p.ordem_corredor, p.nome";

    /**
     * Grava a lista e os itens numa única transação: ou entra tudo, ou nada.
     */
    @Override
    public ListaCompra inserir(ListaCompra lista) {
        String sqlLista = "INSERT INTO LCP_LISTA_COMPRA (id_cliente, nome) VALUES (?, ?)";
        try (Connection conn = ConnectionFactory.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement stmt = conn.prepareStatement(sqlLista, new String[] {"ID_LISTA"})) {
                    stmt.setLong(1, lista.getCliente().getId());
                    stmt.setString(2, lista.getNome());
                    stmt.executeUpdate();
                    lista.setId(JdbcUtil.lerIdGerado(stmt));
                }
                for (ItemLista item : lista.getItens()) {
                    inserirItem(conn, lista.getId(), item);
                }
                conn.commit();
                return lista;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        } catch (SQLException e) {
            throw PersistenciaException.de("cadastrar a lista de compras", e);
        }
    }

    @Override
    public List<ListaCompra> listar() {
        return consultar(SELECT_BASE + "ORDER BY l.data_criacao DESC, l.id_lista DESC", null);
    }

    public List<ListaCompra> listarPorCliente(long idCliente) {
        return consultar(SELECT_BASE + "WHERE cl.id_cliente = ? ORDER BY l.data_criacao DESC", idCliente);
    }

    @Override
    public Optional<ListaCompra> buscarPorId(long id) {
        return consultar(SELECT_BASE + "WHERE l.id_lista = ?", id).stream().findFirst();
    }

    private List<ListaCompra> consultar(String sql, Object parametro) {
        List<ListaCompra> listas = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            if (parametro != null) {
                stmt.setObject(1, parametro);
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Cliente cliente = new Cliente(rs.getLong("id_cliente"), rs.getString("cliente_nome"),
                            rs.getString("telefone"), rs.getString("email"),
                            PerfilProjeto.valueOf(rs.getString("perfil_projeto")));
                    listas.add(new ListaCompra(rs.getLong("id_lista"), cliente, rs.getString("lista_nome"),
                            JdbcUtil.getDataHora(rs, "data_criacao")));
                }
            }
            for (ListaCompra lista : listas) {
                lista.setItens(carregarItens(conn, lista.getId()));
            }
            return listas;
        } catch (SQLException e) {
            throw PersistenciaException.de("consultar as listas de compras", e);
        }
    }

    private List<ItemLista> carregarItens(Connection conn, long idLista) throws SQLException {
        List<ItemLista> itens = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(SELECT_ITENS)) {
            stmt.setLong(1, idLista);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    itens.add(new ItemLista(ProdutoDao.mapear(rs), rs.getInt("quantidade"), rs.getInt("coletado") == 1));
                }
            }
        }
        return itens;
    }

    /** Atualiza o nome da lista. Os itens têm métodos próprios. */
    @Override
    public boolean atualizar(ListaCompra lista) {
        String sql = "UPDATE LCP_LISTA_COMPRA SET nome = ? WHERE id_lista = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, lista.getNome());
            stmt.setLong(2, lista.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar a lista de compras", e);
        }
    }

    /** Exclui a lista; os itens saem junto pelo ON DELETE CASCADE. */
    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_LISTA_COMPRA WHERE id_lista = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir a lista de compras", e);
        }
    }

    // ------------------------------------------------------------------
    // Itens da lista (tabela associativa LCP_ITEM_LISTA)
    // ------------------------------------------------------------------

    public void adicionarItem(long idLista, ItemLista item) {
        try (Connection conn = ConnectionFactory.getConnection()) {
            inserirItem(conn, idLista, item);
        } catch (SQLException e) {
            throw PersistenciaException.de("adicionar o item à lista", e);
        }
    }

    public boolean atualizarItem(long idLista, ItemLista item) {
        String sql = "UPDATE LCP_ITEM_LISTA SET quantidade = ?, coletado = ? WHERE id_lista = ? AND id_produto = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, item.getQuantidade());
            stmt.setInt(2, item.isColetado() ? 1 : 0);
            stmt.setLong(3, idLista);
            stmt.setLong(4, item.getProduto().getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o item da lista", e);
        }
    }

    public boolean removerItem(long idLista, long idProduto) {
        String sql = "DELETE FROM LCP_ITEM_LISTA WHERE id_lista = ? AND id_produto = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idLista);
            stmt.setLong(2, idProduto);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("remover o item da lista", e);
        }
    }

    private void inserirItem(Connection conn, long idLista, ItemLista item) throws SQLException {
        String sql = "INSERT INTO LCP_ITEM_LISTA (id_lista, id_produto, quantidade, coletado) VALUES (?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idLista);
            stmt.setLong(2, item.getProduto().getId());
            stmt.setInt(3, item.getQuantidade());
            stmt.setInt(4, item.isColetado() ? 1 : 0);
            stmt.executeUpdate();
        }
    }
}
