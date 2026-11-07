package br.com.leroycopiloto.dao;

import br.com.leroycopiloto.exception.PersistenciaException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Lê os dados de acesso ao banco do arquivo {@code db.properties}.
 *
 * <p>As credenciais ficam fora do código (o arquivo está no .gitignore). Por
 * padrão o arquivo é procurado na pasta em que o programa roda; outro caminho
 * pode ser passado com {@code -Ddb.config=caminho/do/arquivo}.</p>
 */
public final class DatabaseConfig {

    private static final String ARQUIVO_PADRAO = "db.properties";

    private static DatabaseConfig instancia;

    private final String url;
    private final String usuario;
    private final String senha;

    private DatabaseConfig(String url, String usuario, String senha) {
        this.url = url;
        this.usuario = usuario;
        this.senha = senha;
    }

    /** Carrega o arquivo na primeira chamada e reaproveita nas seguintes. */
    public static synchronized DatabaseConfig carregar() {
        if (instancia == null) {
            Path arquivo = Paths.get(System.getProperty("db.config", ARQUIVO_PADRAO));
            if (!Files.exists(arquivo)) {
                throw new PersistenciaException("Arquivo " + arquivo.toAbsolutePath() + " não encontrado. "
                        + "Copie db.properties.example para db.properties e preencha usuário e senha.", null);
            }

            Properties props = new Properties();
            try (InputStream entrada = Files.newInputStream(arquivo)) {
                props.load(entrada);
            } catch (IOException e) {
                throw new PersistenciaException("Não foi possível ler " + arquivo + ": " + e.getMessage(), e);
            }

            String url = props.getProperty("db.url", "").trim();
            String usuario = props.getProperty("db.usuario", "").trim();
            if (url.isEmpty() || usuario.isEmpty()) {
                throw new PersistenciaException("Preencha db.url e db.usuario no arquivo " + arquivo + ".", null);
            }
            instancia = new DatabaseConfig(url, usuario, props.getProperty("db.senha", ""));
        }
        return instancia;
    }

    public String getUrl() {
        return url;
    }

    public String getUsuario() {
        return usuario;
    }

    public String getSenha() {
        return senha;
    }
}
