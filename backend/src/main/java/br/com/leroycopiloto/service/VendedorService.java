package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.VendedorDao;
import br.com.leroycopiloto.exception.DadosInvalidosException;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.model.Vendedor;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Regras do cadastro de vendedores e da posição deles na loja.
 */
public class VendedorService {

    private static final Pattern MATRICULA = Pattern.compile("^LM-\\d{4}$");

    private final VendedorDao vendedorDao;
    private final LojaService lojaService;

    public VendedorService(VendedorDao vendedorDao, LojaService lojaService) {
        this.vendedorDao = vendedorDao;
        this.lojaService = lojaService;
    }

    /**
     * @param vendedor dados do vendedor; o corredor atual é opcional e só
     *                 precisa ter o código preenchido
     */
    public Vendedor cadastrar(Vendedor vendedor) {
        validar(vendedor);
        garantirMatriculaLivre(vendedor.getMatricula(), null);
        return vendedorDao.inserir(vendedor);
    }

    public List<Vendedor> listar() {
        return vendedorDao.listar();
    }

    public List<Vendedor> listarDisponiveis() {
        return vendedorDao.listarDisponiveis();
    }

    public Vendedor buscarPorId(long id) {
        return vendedorDao.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Vendedor #" + id + " não encontrado."));
    }

    public Vendedor atualizar(Vendedor vendedor) {
        buscarPorId(vendedor.getId());
        validar(vendedor);
        garantirMatriculaLivre(vendedor.getMatricula(), vendedor.getId());
        vendedorDao.atualizar(vendedor);
        return vendedor;
    }

    /** Registra em qual corredor o vendedor está agora. */
    public Vendedor moverPara(long idVendedor, String codigoCorredor) {
        Vendedor vendedor = buscarPorId(idVendedor);
        vendedor.setCorredorAtual(lojaService.buscarCorredor(codigoCorredor));
        vendedorDao.atualizar(vendedor);
        return vendedor;
    }

    public Vendedor alterarDisponibilidade(long idVendedor, boolean disponivel) {
        Vendedor vendedor = buscarPorId(idVendedor);
        vendedor.setDisponivel(disponivel);
        vendedorDao.atualizar(vendedor);
        return vendedor;
    }

    public void excluir(long id) {
        buscarPorId(id);
        vendedorDao.excluir(id);
    }

    private void validar(Vendedor vendedor) {
        vendedor.setMatricula(Validador.formato(vendedor.getMatricula(), "matrícula", MATRICULA, "LM-0000"));
        vendedor.setNome(Validador.obrigatorio(vendedor.getNome(), "nome", 100));
        vendedor.setTelefone(Validador.telefone(vendedor.getTelefone()));
        Validador.naoNulo(vendedor.getEspecialidade(), "especialidade");
        if (vendedor.getCorredorAtual() != null) {
            vendedor.setCorredorAtual(lojaService.buscarCorredor(vendedor.getCorredorAtual().getCodigo()));
        }
    }

    private void garantirMatriculaLivre(String matricula, Long idAtual) {
        Optional<Vendedor> existente = vendedorDao.buscarPorMatricula(matricula);
        if (existente.isPresent() && !existente.get().getId().equals(idAtual)) {
            throw new DadosInvalidosException("Já existe um vendedor com a matrícula " + matricula + ".");
        }
    }
}
