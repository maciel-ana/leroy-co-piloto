package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.CorredorDao;
import br.com.leroycopiloto.dao.SetorDao;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.model.Corredor;
import br.com.leroycopiloto.model.Setor;

import java.util.List;

/**
 * Consulta a planta da loja: setores e corredores (os pontos das placas QR).
 */
public class LojaService {

    private final SetorDao setorDao;
    private final CorredorDao corredorDao;

    public LojaService(SetorDao setorDao, CorredorDao corredorDao) {
        this.setorDao = setorDao;
        this.corredorDao = corredorDao;
    }

    public List<Setor> listarSetores() {
        return setorDao.listar();
    }

    public List<Corredor> listarCorredores() {
        return corredorDao.listar();
    }

    public Corredor buscarCorredor(String codigo) {
        String limpo = Validador.obrigatorio(codigo, "corredor", 5).toUpperCase();
        return corredorDao.buscarPorCodigo(limpo)
                .orElseThrow(() -> new NaoEncontradoException("Corredor " + limpo + " não existe na loja."));
    }
}
