package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.ChamadoRuptura;
import br.com.leroycopiloto.model.Cliente;
import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Produto;
import br.com.leroycopiloto.model.Vendedor;
import br.com.leroycopiloto.model.enums.Categoria;
import br.com.leroycopiloto.model.enums.PrioridadeChamado;
import br.com.leroycopiloto.model.enums.StatusChamado;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CRUD da tabela LCP_CHAMADO_RUPTURA. A leitura junta cliente, produto,
 * corredor e vendedor para a fila ficar legível sem consultas extras.
 */
public class ChamadoRupturaDao implements Dao<ChamadoRuptura> {

    private static final String SELECT_BASE =
            "SELECT ch.id_chamado, ch.status, ch.prioridade, ch.observacao, ch.data_abertura, ch.data_fechamento, "
          + "       cl.id_cliente, cl.nome AS cliente_nome, cl.email AS cliente_email, "
          + "       p.id_produto, p.sku, p.nome AS produto_nome, p.categoria, p.preco, p.estoque, "
          + "       co.id_corredor, co.codigo AS corredor_codigo, "
          + "       v.id_vendedor, v.nome AS vendedor_nome, v.matricula "
          + "  FROM LCP_CHAMADO_RUPTURA ch "
          + "  JOIN LCP_CLIENTE cl ON cl.id_cliente = ch.id_cliente "
          + "  JOIN LCP_PRODUTO p ON p.id_produto = ch.id_produto "
          + "  JOIN LCP_CORREDOR co ON co.id_corredor = p.id_corredor "
          + "  LEFT JOIN LCP_VENDEDOR v ON v.id_vendedor = ch.id_vendedor ";

    /** Fila de atendimento: só abertos, obra parada primeiro, depois o mais antigo. */
    private static final String ORDEM_FILA =
            "ORDER BY CASE ch.prioridade WHEN 'ALTA_PROJETO_PARADO' THEN 1 WHEN 'MEDIA' THEN 2 ELSE 3 END, "
          + "ch.data_abertura";

    private static ChamadoRuptura mapear(ResultSet rs) throws SQLException {
        Cliente cliente = new Cliente();
        cliente.setId(rs.getLong("id_cliente"));
        cliente.setNome(rs.getString("cliente_nome"));
        cliente.setEmail(rs.getString("cliente_email"));

        Corredor corredor = new Corredor();
        corredor.setId(rs.getLong("id_corredor"));
        corredor.setCodigo(rs.getString("corredor_codigo"));

        Produto produto = new Produto();
        produto.setId(rs.getLong("id_produto"));
        produto.setSku(rs.getString("sku"));
        produto.setNome(rs.getString("produto_nome"));
        produto.setCategoria(Categoria.valueOf(rs.getString("categoria")));
        produto.setPreco(rs.getBigDecimal("preco"));
        produto.setEstoque(rs.getInt("estoque"));
        produto.setCorredor(corredor);

        Vendedor vendedor = null;
        Long idVendedor = JdbcUtil.getLongOuNulo(rs, "id_vendedor");
        if (idVendedor != null) {
            vendedor = new Vendedor();
            vendedor.setId(idVendedor);
            vendedor.setNome(rs.getString("vendedor_nome"));
            vendedor.setMatricula(rs.getString("matricula"));
        }

        return new ChamadoRuptura(rs.getLong("id_chamado"), cliente, produto, vendedor,
                StatusChamado.valueOf(rs.getString("status")),
                PrioridadeChamado.valueOf(rs.getString("prioridade")),
                rs.getString("observacao"),
                JdbcUtil.getDataHora(rs, "data_abertura"),
                JdbcUtil.getDataHora(rs, "data_fechamento"));
    }

    @Override
    public ChamadoRuptura inserir(ChamadoRuptura chamado) {
        String sql = "INSERT INTO LCP_CHAMADO_RUPTURA (id_cliente, id_produto, id_vendedor, status, prioridade, "
                   + "observacao, data_abertura, data_fechamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, new String[] {"ID_CHAMADO"})) {
            stmt.setLong(1, chamado.getCliente().getId());
            stmt.setLong(2, chamado.getProduto().getId());
            JdbcUtil.setLongOuNulo(stmt, 3, chamado.getVendedor() == null ? null : chamado.getVendedor().getId());
            stmt.setString(4, chamado.getStatus().name());
            stmt.setString(5, chamado.getPrioridade().name());
            stmt.setString(6, chamado.getObservacao());
            JdbcUtil.setDataHoraOuNula(stmt, 7, chamado.getDataAbertura());
            JdbcUtil.setDataHoraOuNula(stmt, 8, chamado.getDataFechamento());
            stmt.executeUpdate();
            chamado.setId(JdbcUtil.lerIdGerado(stmt));
            return chamado;
        } catch (SQLException e) {
            throw PersistenciaException.de("abrir o chamado", e);
        }
    }

    @Override
    public List<ChamadoRuptura> listar() {
        return consultar(SELECT_BASE + "ORDER BY ch.data_abertura DESC", null);
    }

    /** Chamados ainda em aberto, na ordem em que devem ser atendidos. */
    public List<ChamadoRuptura> listarFila() {
        return consultar(SELECT_BASE
                + "WHERE ch.status IN ('AGUARDANDO_FILA', 'EM_DESLOCAMENTO', 'EM_ATENDIMENTO', 'SUBSTITUTO_OFERECIDO') "
                + ORDEM_FILA, null);
    }

    /** Chamado aberto do mesmo cliente para o mesmo produto, se houver. */
    public Optional<ChamadoRuptura> buscarAberto(long idCliente, long idProduto) {
        String sql = SELECT_BASE
                + "WHERE ch.id_cliente = ? AND ch.id_produto = ? "
                + "  AND ch.status IN ('AGUARDANDO_FILA', 'EM_DESLOCAMENTO', 'EM_ATENDIMENTO', 'SUBSTITUTO_OFERECIDO')";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idCliente);
            stmt.setLong(2, idProduto);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw PersistenciaException.de("consultar os chamados", e);
        }
    }

    @Override
    public Optional<ChamadoRuptura> buscarPorId(long id) {
        return consultar(SELECT_BASE + "WHERE ch.id_chamado = ?", id).stream().findFirst();
    }

    private List<ChamadoRuptura> consultar(String sql, Object parametro) {
        List<ChamadoRuptura> chamados = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            if (parametro != null) {
                stmt.setObject(1, parametro);
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    chamados.add(mapear(rs));
                }
            }
            return chamados;
        } catch (SQLException e) {
            throw PersistenciaException.de("consultar os chamados", e);
        }
    }

    /** Atualiza vendedor, status, prioridade, observação e data de fechamento. */
    @Override
    public boolean atualizar(ChamadoRuptura chamado) {
        String sql = "UPDATE LCP_CHAMADO_RUPTURA SET id_vendedor = ?, status = ?, prioridade = ?, observacao = ?, "
                   + "data_fechamento = ? WHERE id_chamado = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            JdbcUtil.setLongOuNulo(stmt, 1, chamado.getVendedor() == null ? null : chamado.getVendedor().getId());
            stmt.setString(2, chamado.getStatus().name());
            stmt.setString(3, chamado.getPrioridade().name());
            stmt.setString(4, chamado.getObservacao());
            JdbcUtil.setDataHoraOuNula(stmt, 5, chamado.getDataFechamento());
            stmt.setLong(6, chamado.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("atualizar o chamado", e);
        }
    }

    @Override
    public boolean excluir(long id) {
        String sql = "DELETE FROM LCP_CHAMADO_RUPTURA WHERE id_chamado = ?";
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw PersistenciaException.de("excluir o chamado", e);
        }
    }
}
