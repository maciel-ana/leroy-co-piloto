package br.com.leroycopiloto.service;

import br.com.leroycopiloto.dao.ClienteDao;
import br.com.leroycopiloto.exception.DadosInvalidosException;
import br.com.leroycopiloto.exception.NaoEncontradoException;
import br.com.leroycopiloto.model.Cliente;

import java.util.List;
import java.util.Optional;

/**
 * Regras do cadastro de clientes.
 */
public class ClienteService {

    private final ClienteDao clienteDao;

    public ClienteService(ClienteDao clienteDao) {
        this.clienteDao = clienteDao;
    }

    public Cliente cadastrar(Cliente cliente) {
        validar(cliente);
        garantirEmailLivre(cliente.getEmail(), null);
        return clienteDao.inserir(cliente);
    }

    public List<Cliente> listar() {
        return clienteDao.listar();
    }

    public Cliente buscarPorId(long id) {
        return clienteDao.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Cliente #" + id + " não encontrado."));
    }

    public Cliente atualizar(Cliente cliente) {
        buscarPorId(cliente.getId());
        validar(cliente);
        garantirEmailLivre(cliente.getEmail(), cliente.getId());
        clienteDao.atualizar(cliente);
        return cliente;
    }

    /**
     * Exclui o cliente e, em cascata, as listas dele. Se ele tiver chamados,
     * o banco recusa e a mensagem explica o motivo.
     */
    public void excluir(long id) {
        buscarPorId(id);
        clienteDao.excluir(id);
    }

    private void validar(Cliente cliente) {
        cliente.setNome(Validador.obrigatorio(cliente.getNome(), "nome", 100));
        cliente.setEmail(Validador.email(cliente.getEmail()));
        cliente.setTelefone(Validador.telefone(cliente.getTelefone()));
        Validador.naoNulo(cliente.getPerfilProjeto(), "perfil do projeto");
    }

    private void garantirEmailLivre(String email, Long idAtual) {
        Optional<Cliente> existente = clienteDao.buscarPorEmail(email);
        if (existente.isPresent() && !existente.get().getId().equals(idAtual)) {
            throw new DadosInvalidosException("Já existe um cliente com o e-mail " + email + ".");
        }
    }
}
