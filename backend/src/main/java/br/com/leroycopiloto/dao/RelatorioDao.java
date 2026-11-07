package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;
import br.com.leroycopiloto.model.LinhaRelatorio;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Relatórios operacionais com JOIN e agregação (COUNT, SUM, GROUP BY).
 * As mesmas consultas estão em sql/relatorios.sql para rodar no SQL Developer.
 *
 * <p>Toda consulta devolve três colunas: rótulo, quantidade e valor
 * (o valor pode ser NULL quando não se aplica).</p>
 */
public class RelatorioDao {

    /** Quantos chamados "Não achei" cada setor recebeu. */
    public List<LinhaRelatorio> chamadosPorSetor() {
        return consultar(
                "SELECT s.nome AS rotulo, COUNT(ch.id_chamado) AS quantidade, NULL AS valor "
              + "  FROM LCP_SETOR s "
              + "  JOIN LCP_CORREDOR c ON c.id_setor = s.id_setor "
              + "  JOIN LCP_PRODUTO p ON p.id_corredor = c.id_corredor "
              + "  JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_produto = p.id_produto "
              + " GROUP BY s.nome "
              + " ORDER BY quantidade DESC, s.nome");
    }

    /** Os 5 produtos com mais chamados e o valor que deixaria de ser vendido. */
    public List<LinhaRelatorio> produtosMaisReportados() {
        return consultar(
                "SELECT p.sku || ' ' || p.nome AS rotulo, COUNT(ch.id_chamado) AS quantidade, "
              + "       SUM(p.preco) AS valor "
              + "  FROM LCP_PRODUTO p "
              + "  JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_produto = p.id_produto "
              + " GROUP BY p.sku, p.nome "
              + " ORDER BY quantidade DESC, p.nome "
              + " FETCH FIRST 5 ROWS ONLY");
    }

    /** Chamados por vendedor, incluindo quem ainda não atendeu nenhum (LEFT JOIN). */
    public List<LinhaRelatorio> chamadosPorVendedor() {
        return consultar(
                "SELECT v.nome || ' (' || v.matricula || ')' AS rotulo, COUNT(ch.id_chamado) AS quantidade, "
              + "       NULL AS valor "
              + "  FROM LCP_VENDEDOR v "
              + "  LEFT JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_vendedor = v.id_vendedor "
              + " GROUP BY v.nome, v.matricula "
              + " ORDER BY quantidade DESC, v.nome");
    }

    /** Quantas listas cada cliente tem e quanto elas somam em reais. */
    public List<LinhaRelatorio> valorDasListasPorCliente() {
        return consultar(
                "SELECT cl.nome AS rotulo, COUNT(DISTINCT l.id_lista) AS quantidade, "
              + "       SUM(p.preco * i.quantidade) AS valor "
              + "  FROM LCP_CLIENTE cl "
              + "  JOIN LCP_LISTA_COMPRA l ON l.id_cliente = cl.id_cliente "
              + "  JOIN LCP_ITEM_LISTA i ON i.id_lista = l.id_lista "
              + "  JOIN LCP_PRODUTO p ON p.id_produto = i.id_produto "
              + " GROUP BY cl.nome "
              + " ORDER BY valor DESC");
    }

    /** Produtos com estoque zerado em cada corredor. */
    public List<LinhaRelatorio> rupturasPorCorredor() {
        return consultar(
                "SELECT c.codigo || ' - ' || s.nome AS rotulo, COUNT(p.id_produto) AS quantidade, NULL AS valor "
              + "  FROM LCP_CORREDOR c "
              + "  JOIN LCP_SETOR s ON s.id_setor = c.id_setor "
              + "  JOIN LCP_PRODUTO p ON p.id_corredor = c.id_corredor "
              + " WHERE p.estoque = 0 "
              + " GROUP BY c.codigo, s.nome "
              + " ORDER BY c.codigo");
    }

    private List<LinhaRelatorio> consultar(String sql) {
        List<LinhaRelatorio> linhas = new ArrayList<>();
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                BigDecimal valor = rs.getBigDecimal("valor");
                linhas.add(new LinhaRelatorio(rs.getString("rotulo"), rs.getLong("quantidade"), valor));
            }
            return linhas;
        } catch (SQLException e) {
            throw PersistenciaException.de("gerar o relatório", e);
        }
    }
}
