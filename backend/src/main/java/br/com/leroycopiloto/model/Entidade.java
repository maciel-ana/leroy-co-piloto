package br.com.leroycopiloto.model;

/**
 * Contrato comum das classes que viram uma linha com chave própria no banco.
 *
 * <p>Os DAOs trabalham com essa interface para ler e preencher o id gerado
 * pelo IDENTITY do Oracle depois de um INSERT.</p>
 */
public interface Entidade {

    Long getId();

    void setId(Long id);
}
