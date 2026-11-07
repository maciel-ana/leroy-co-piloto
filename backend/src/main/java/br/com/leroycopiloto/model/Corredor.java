package br.com.leroycopiloto.model;

/**
 * Corredor da loja com a posição no mapa. É o ponto que cada placa QR
 * identifica e a base do cálculo de rota e de distância até o vendedor.
 * Tabela LCP_CORREDOR.
 */
public class Corredor implements Entidade {

    /** Linha da circulação central: todo deslocamento passa por ela. */
    private static final int Y_CIRCULACAO = 155;

    private Long id;
    private String codigo;
    private Setor setor;
    private int posX;
    private int posY;
    private int largura;
    private int altura;

    public Corredor() {
    }

    public Corredor(Long id, String codigo, Setor setor, int posX, int posY, int largura, int altura) {
        this.id = id;
        this.codigo = codigo;
        this.setor = setor;
        this.posX = posX;
        this.posY = posY;
        this.largura = largura;
        this.altura = altura;
    }

    /**
     * Distância a pé até outro corredor, indo pela circulação central.
     * É a mesma conta do protótipo web (routeEngine.js).
     */
    public double distanciaAte(Corredor outro) {
        if (outro == null) {
            return Double.MAX_VALUE;
        }
        if (codigo != null && codigo.equals(outro.codigo)) {
            return 0;
        }
        return Math.abs(centroX() - outro.centroX())
                + Math.abs(bordaY() - Y_CIRCULACAO)
                + Math.abs(outro.bordaY() - Y_CIRCULACAO);
    }

    private double centroX() {
        return posX + largura / 2.0;
    }

    /** Borda do corredor voltada para a circulação central. */
    private int bordaY() {
        return posY + altura <= Y_CIRCULACAO ? posY + altura : posY;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Setor getSetor() {
        return setor;
    }

    public void setSetor(Setor setor) {
        this.setor = setor;
    }

    public int getPosX() {
        return posX;
    }

    public void setPosX(int posX) {
        this.posX = posX;
    }

    public int getPosY() {
        return posY;
    }

    public void setPosY(int posY) {
        this.posY = posY;
    }

    public int getLargura() {
        return largura;
    }

    public void setLargura(int largura) {
        this.largura = largura;
    }

    public int getAltura() {
        return altura;
    }

    public void setAltura(int altura) {
        this.altura = altura;
    }

    @Override
    public String toString() {
        return setor == null ? codigo : codigo + " (" + setor.getNome() + ")";
    }
}
