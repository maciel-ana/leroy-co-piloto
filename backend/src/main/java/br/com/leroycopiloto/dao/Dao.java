package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.model.Entidade;

import java.util.List;
import java.util.Optional;

/**
 * Operações de CRUD que todo DAO do sistema oferece.
 *
 * <p>Os métodos não declaram {@code SQLException}: as implementações a
 * convertem em {@link br.com.leroycopiloto.exception.PersistenciaException}
 * com uma mensagem clara.</p>
 *
 * @param <T> entidade persistida
 */
public interface Dao<T extends Entidade> {

    /** INSERT. Devolve a mesma entidade com o id gerado pelo banco. */
    T inserir(T entidade);

    /** SELECT de todos os registros. */
    List<T> listar();

    /** SELECT por chave primária. */
    Optional<T> buscarPorId(long id);

    /** UPDATE pelo id da entidade. Devolve false se o id não existir. */
    boolean atualizar(T entidade);

    /** DELETE pelo id. Devolve false se o id não existir. */
    boolean excluir(long id);
}
