package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.LinhaRelatorio;
import br.com.leroycopiloto.service.RelatorioService;

import java.util.List;

/**
 * Relatórios gerados no banco com JOIN e GROUP BY.
 */
public class RelatorioMenu extends Menu {

    private final RelatorioService relatorioService;

    public RelatorioMenu(Console console, RelatorioService relatorioService) {
        super(console);
        this.relatorioService = relatorioService;
    }

    @Override
    protected String titulo() {
        return "RELATÓRIOS";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Chamados por setor",
            "2 - Top 5 produtos mais reportados",
            "3 - Chamados por vendedor",
            "4 - Valor das listas por cliente",
            "5 - Produtos em ruptura por corredor"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> imprimir("Chamados por setor", "Setor", "Chamados", null,
                    relatorioService.chamadosPorSetor());
            case 2 -> imprimir("Top 5 produtos mais reportados", "Produto", "Chamados", "R$ em risco",
                    relatorioService.produtosMaisReportados());
            case 3 -> imprimir("Chamados por vendedor", "Vendedor", "Chamados", null,
                    relatorioService.chamadosPorVendedor());
            case 4 -> imprimir("Valor das listas por cliente", "Cliente", "Listas", "Total R$",
                    relatorioService.valorDasListasPorCliente());
            case 5 -> imprimir("Produtos em ruptura por corredor", "Corredor", "Produtos", null,
                    relatorioService.rupturasPorCorredor());
            default -> console.erro("Opção inválida.");
        }
    }

    private void imprimir(String titulo, String colunaRotulo, String colunaQuantidade, String colunaValor,
                          List<LinhaRelatorio> linhas) {
        System.out.println();
        System.out.println("--- " + titulo + " ---");
        String cabecalho = String.format("%-45s %5s", colunaRotulo, colunaQuantidade);
        System.out.println(colunaValor == null ? cabecalho : cabecalho + String.format("   %10s", colunaValor));
        if (linhas.isEmpty()) {
            System.out.println("(sem dados)");
        }
        for (LinhaRelatorio linha : linhas) {
            System.out.println(linha);
        }
    }
}
