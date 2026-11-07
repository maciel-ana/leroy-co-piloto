package br.com.leroycopiloto;

import br.com.leroycopiloto.dao.ChamadoRupturaDao;
import br.com.leroycopiloto.dao.ClienteDao;
import br.com.leroycopiloto.dao.ConnectionFactory;
import br.com.leroycopiloto.dao.CorredorDao;
import br.com.leroycopiloto.dao.ListaCompraDao;
import br.com.leroycopiloto.dao.ProdutoDao;
import br.com.leroycopiloto.dao.RelatorioDao;
import br.com.leroycopiloto.dao.SetorDao;
import br.com.leroycopiloto.dao.VendedorDao;
import br.com.leroycopiloto.exception.EntradaEncerradaException;
import br.com.leroycopiloto.exception.SistemaException;
import br.com.leroycopiloto.service.ChamadoService;
import br.com.leroycopiloto.service.ClienteService;
import br.com.leroycopiloto.service.ListaCompraService;
import br.com.leroycopiloto.service.LojaService;
import br.com.leroycopiloto.service.ProdutoService;
import br.com.leroycopiloto.service.RelatorioService;
import br.com.leroycopiloto.service.VendedorService;
import br.com.leroycopiloto.view.ChamadoMenu;
import br.com.leroycopiloto.view.ClienteMenu;
import br.com.leroycopiloto.view.Console;
import br.com.leroycopiloto.view.ListaCompraMenu;
import br.com.leroycopiloto.view.LojaMenu;
import br.com.leroycopiloto.view.MenuPrincipal;
import br.com.leroycopiloto.view.ProdutoMenu;
import br.com.leroycopiloto.view.RelatorioMenu;
import br.com.leroycopiloto.view.VendedorMenu;

import java.util.Scanner;

/**
 * Ponto de entrada: confere o banco, monta as camadas
 * (DAO -> service -> menus) e abre o menu principal.
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("Leroy Co-Piloto - conectando ao banco...");
        try {
            ConnectionFactory.verificarConexao();
        } catch (SistemaException e) {
            System.out.println("!! " + e.getMessage());
            return;
        }
        System.out.println("Conectado.");

        ProdutoDao produtoDao = new ProdutoDao();
        LojaService lojaService = new LojaService(new SetorDao(), new CorredorDao());
        ProdutoService produtoService = new ProdutoService(produtoDao, lojaService);
        ClienteService clienteService = new ClienteService(new ClienteDao());
        VendedorService vendedorService = new VendedorService(new VendedorDao(), lojaService);
        ListaCompraService listaService =
                new ListaCompraService(new ListaCompraDao(), clienteService, produtoService, lojaService);
        ChamadoService chamadoService = new ChamadoService(new ChamadoRupturaDao(), produtoDao,
                clienteService, produtoService, vendedorService);
        RelatorioService relatorioService = new RelatorioService(new RelatorioDao());

        Console console = new Console(new Scanner(System.in));
        MenuPrincipal menu = new MenuPrincipal(console,
                new ListaCompraMenu(console, listaService),
                new ChamadoMenu(console, chamadoService),
                new ProdutoMenu(console, produtoService),
                new ClienteMenu(console, clienteService),
                new VendedorMenu(console, vendedorService),
                new LojaMenu(console, lojaService),
                new RelatorioMenu(console, relatorioService));

        try {
            menu.abrir();
        } catch (EntradaEncerradaException e) {
            System.out.println();
        }
        System.out.println("Até logo!");
    }
}
