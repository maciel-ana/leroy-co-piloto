# Leroy Co-Piloto: back-end Java + JDBC

Aplicação de console em Java que grava e lê tudo do banco Oracle da FIAP via JDBC. Tem CRUD completo de produtos, clientes, vendedores, listas de compras (com os itens) e chamados de ruptura ("Não achei"). Também calcula a rota dentro da loja, escolhe o vendedor mais próximo para cada chamado e gera relatórios com JOIN e GROUP BY.

## Pré-requisitos

- JDK 17 ou mais novo
- Maven 3.8+ (ou IntelliJ IDEA, que já traz o Maven)
- Acesso ao Oracle da FIAP (`oracle.fiap.com.br:1521:ORCL`) e ao SQL Developer

## Como rodar

### 1. Criar as tabelas e a carga inicial

No SQL Developer, conecte com o seu usuário da FIAP, abra `sql/leroy_co_piloto.sql` e use **Executar Script (F5)**. O script apaga as tabelas antigas (se existirem), cria as 8 tabelas e insere os dados da loja de demonstração. Ele pode ser rodado de novo sempre que quiser voltar ao estado inicial.

### 2. Configurar o acesso ao banco

Dentro da pasta `backend/`, copie o modelo e preencha usuário e senha:

```bash
cp db.properties.example db.properties
```

```properties
db.url=jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL
db.usuario=RM123456
db.senha=sua_senha
```

O `db.properties` está no `.gitignore`, então a senha não vai para o GitHub.

### 3. Executar

Pelo terminal, dentro de `backend/`:

```bash
mvn compile exec:java
```

Pelo IntelliJ: abra a pasta `backend/` como projeto Maven, espere baixar as dependências e rode `br.com.leroycopiloto.Main`. A pasta de trabalho da execução precisa ser `backend/`, que é onde fica o `db.properties`.

Ao abrir, o programa testa a conexão. Se faltar o `db.properties`, se a senha estiver errada ou se o script não tiver sido rodado, ele mostra o motivo e fecha sem erro.

## Menu

```
=== LEROY CO-PILOTO ===
1 - LISTAS DE COMPRAS (MODO MISSÃO)   CRUD de listas e itens + rota na loja
2 - CHAMADOS DE RUPTURA ("NÃO ACHEI") abrir, fila, status, reatribuir, excluir
3 - PRODUTOS                          CRUD + pesquisa por nome + estoque
4 - CLIENTES                          CRUD
5 - VENDEDORES                        CRUD + corredor atual + disponibilidade
6 - MAPA DA LOJA                      setores, corredores e distância
7 - RELATÓRIOS                        consultas com JOIN e GROUP BY
0 - Sair
```

Roteiro rápido para a demonstração:

1. **Chamados → 1**: mostra a fila que veio do banco.
2. **Chamados → 4**: abre um "Não achei" (cliente 2, produto 11). O sistema escolhe o vendedor e grava o chamado.
3. **Chamados → 1**: o chamado novo aparece na fila, lido do banco.
4. **Chamados → 5**: muda o status para `RUPTURA_CONFIRMADA`. O chamado sai da fila e o estoque do produto vai a zero.
5. **Listas → 10**: calcula a rota da lista 1 a partir do corredor `B02`.
6. **Relatórios → 1 e 2**: mostram os chamados por setor e os produtos mais reportados.

## Estrutura

```
backend/src/main/java/br/com/leroycopiloto/
├── Main.java        monta as camadas e abre o menu
├── model/           entidades (Pessoa → Cliente/Vendedor, Produto, Corredor...) e enums
├── dao/             JDBC: interface Dao<T> + um DAO por tabela + RelatorioDao
├── service/         regras de negócio e validação de entrada
├── exception/       SistemaException e subclasses com mensagens claras
└── view/            menus de console (todos herdam de Menu)
```

| Requisito | Onde está |
|---|---|
| POO: herança e interface | `Pessoa` (abstrata) → `Cliente` e `Vendedor`; interface `Entidade`; interface genérica `Dao<T>`; `Menu` (abstrata) → 8 menus |
| CRUD via JDBC | `ProdutoDao`, `ClienteDao`, `VendedorDao`, `ListaCompraDao` (com os itens N:N), `ChamadoRupturaDao`, `SetorDao` e `CorredorDao`, todos com `PreparedStatement` |
| Camadas separadas | pacotes `model`, `dao`, `service` e `view` |
| Tratamento de erros | os services validam a entrada (`DadosInvalidosException`, `NaoEncontradoException`, `OperacaoInvalidaException`); os DAOs traduzem `SQLException` em `PersistenciaException` (ex.: ORA-00001 vira "SKU, e-mail ou matrícula repetido"); `Menu` captura tudo e o programa continua rodando |
| Transação | `ListaCompraDao.inserir` grava a lista e os itens com commit/rollback |
| Relatórios SQL | `RelatorioDao` e `sql/relatorios.sql` |

## Banco e diagramas

- `sql/leroy_co_piloto.sql`: DDL e carga inicial (8 tabelas; N:N `LCP_LISTA_COMPRA` ↔ `LCP_PRODUTO` via `LCP_ITEM_LISTA`)
- `sql/relatorios.sql`: as 5 consultas de relatório, para rodar no SQL Developer
- `diagramas/diagrama-er.pdf` e `.png`: diagrama entidade-relacionamento
- `diagramas/diagrama-classes.pdf` (4 páginas) e `.png`: diagrama de classes UML (model, dao, service + exception, view)
