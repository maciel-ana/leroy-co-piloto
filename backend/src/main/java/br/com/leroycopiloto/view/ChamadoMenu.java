package br.com.leroycopiloto.view;

import br.com.leroycopiloto.model.ChamadoRuptura;
import br.com.leroycopiloto.model.enums.PrioridadeChamado;
import br.com.leroycopiloto.model.enums.StatusChamado;
import br.com.leroycopiloto.service.ChamadoService;

/**
 * Botão "Não achei" (cliente) e fila de atendimento (vendedor).
 */
public class ChamadoMenu extends Menu {

    private final ChamadoService chamadoService;

    public ChamadoMenu(Console console, ChamadoService chamadoService) {
        super(console);
        this.chamadoService = chamadoService;
    }

    @Override
    protected String titulo() {
        return "CHAMADOS DE RUPTURA (\"NÃO ACHEI\")";
    }

    @Override
    protected String[] opcoes() {
        return new String[] {
            "1 - Fila de atendimento (abertos)",
            "2 - Histórico de chamados",
            "3 - Buscar por id",
            "4 - Abrir chamado \"Não achei\"",
            "5 - Atualizar status do atendimento",
            "6 - Alterar prioridade / observação",
            "7 - Passar para outro vendedor",
            "8 - Excluir chamado"
        };
    }

    @Override
    protected void executar(int opcao) {
        switch (opcao) {
            case 1 -> console.imprimirLista("Fila de atendimento", chamadoService.listarFila());
            case 2 -> console.imprimirLista("Todos os chamados", chamadoService.listar());
            case 3 -> mostrarDetalhe(chamadoService.buscarPorId(console.lerId("Id do chamado")));
            case 4 -> abrirChamado();
            case 5 -> atualizarStatus();
            case 6 -> alterarDetalhes();
            case 7 -> reatribuir();
            case 8 -> excluir();
            default -> console.erro("Opção inválida.");
        }
    }

    private void abrirChamado() {
        long idCliente = console.lerId("Id do cliente");
        long idProduto = console.lerId("Id do produto que não foi encontrado");
        PrioridadeChamado prioridade = console.escolher("Prioridade", PrioridadeChamado.class, null);
        String observacao = console.lerTexto("Observação (opcional)");

        ChamadoRuptura chamado = chamadoService.abrir(idCliente, idProduto, prioridade, observacao);
        console.sucesso("Chamado #" + chamado.getId() + " aberto. "
                + (chamado.getVendedor() == null
                    ? "Nenhum vendedor disponível agora: o chamado ficou na fila."
                    : chamado.getVendedor().getNome() + " foi avisado(a) e vai até o corredor "
                        + chamado.getProduto().getCorredor().getCodigo() + "."));
    }

    private void atualizarStatus() {
        long id = console.lerId("Id do chamado");
        StatusChamado status = console.escolher("Novo status", StatusChamado.class, null);
        ChamadoRuptura chamado = chamadoService.atualizarStatus(id, status);
        console.sucesso("Chamado #" + id + " agora está " + chamado.getStatus()
                + (chamado.isAberto() ? "." : " e saiu da fila."));
    }

    private void alterarDetalhes() {
        ChamadoRuptura chamado = chamadoService.buscarPorId(console.lerId("Id do chamado"));
        PrioridadeChamado prioridade = console.escolher("Prioridade", PrioridadeChamado.class, chamado.getPrioridade());
        String observacao = console.lerTexto("Observação", chamado.getObservacao());
        chamadoService.alterarDetalhes(chamado.getId(), prioridade, observacao);
        console.sucesso("Chamado atualizado.");
    }

    private void reatribuir() {
        long id = console.lerId("Id do chamado");
        long idVendedor = console.lerId("Id do novo vendedor");
        ChamadoRuptura chamado = chamadoService.reatribuir(id, idVendedor);
        console.sucesso("Chamado #" + id + " passou para " + chamado.getVendedor().getNome() + ".");
    }

    private void excluir() {
        ChamadoRuptura chamado = chamadoService.buscarPorId(console.lerId("Id do chamado"));
        if (console.lerSimNao("Excluir o chamado #" + chamado.getId() + "?")) {
            chamadoService.excluir(chamado.getId());
            console.sucesso("Chamado excluído.");
        }
    }

    private void mostrarDetalhe(ChamadoRuptura chamado) {
        System.out.println(chamado);
        System.out.println("  Observação: " + (chamado.getObservacao() == null ? "-" : chamado.getObservacao()));
        System.out.println("  Encerrado em: " + (chamado.getDataFechamento() == null ? "ainda aberto" : chamado.getDataFechamento()));
    }
}
