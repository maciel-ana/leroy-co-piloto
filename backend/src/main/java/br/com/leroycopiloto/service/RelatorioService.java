package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.RelatorioDao;
import br.com.leroycopiloto.model.LinhaRelatorio;

import java.util.List;

/**
 * Relatórios operacionais para a gerência da loja.
 */
public class RelatorioService {

    private final RelatorioDao relatorioDao;

    public RelatorioService(RelatorioDao relatorioDao) {
        this.relatorioDao = relatorioDao;
    }

    public List<LinhaRelatorio> chamadosPorSetor() {
        return relatorioDao.chamadosPorSetor();
    }

    public List<LinhaRelatorio> produtosMaisReportados() {
        return relatorioDao.produtosMaisReportados();
    }

    public List<LinhaRelatorio> chamadosPorVendedor() {
        return relatorioDao.chamadosPorVendedor();
    }

    public List<LinhaRelatorio> valorDasListasPorCliente() {
        return relatorioDao.valorDasListasPorCliente();
    }

    public List<LinhaRelatorio> rupturasPorCorredor() {
        return relatorioDao.rupturasPorCorredor();
    }
}
