-- ============================================================================
-- LEROY CO-PILOTO | Relatórios operacionais (JOIN + agregação)
-- São as mesmas consultas do RelatorioDao.java, para rodar no SQL Developer
-- depois do leroy_co_piloto.sql.
-- ============================================================================

-- 1. Chamados "Não achei" por setor da loja
SELECT s.nome AS setor, COUNT(ch.id_chamado) AS chamados
  FROM LCP_SETOR s
  JOIN LCP_CORREDOR c ON c.id_setor = s.id_setor
  JOIN LCP_PRODUTO p ON p.id_corredor = c.id_corredor
  JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_produto = p.id_produto
 GROUP BY s.nome
 ORDER BY chamados DESC, s.nome;

-- 2. Top 5 produtos mais reportados e o valor de venda em risco
SELECT p.sku, p.nome, COUNT(ch.id_chamado) AS chamados, SUM(p.preco) AS valor_em_risco
  FROM LCP_PRODUTO p
  JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_produto = p.id_produto
 GROUP BY p.sku, p.nome
 ORDER BY chamados DESC, p.nome
 FETCH FIRST 5 ROWS ONLY;

-- 3. Chamados por vendedor (LEFT JOIN mostra também quem não atendeu nenhum)
SELECT v.nome, v.matricula, COUNT(ch.id_chamado) AS chamados
  FROM LCP_VENDEDOR v
  LEFT JOIN LCP_CHAMADO_RUPTURA ch ON ch.id_vendedor = v.id_vendedor
 GROUP BY v.nome, v.matricula
 ORDER BY chamados DESC, v.nome;

-- 4. Quantidade de listas e valor total por cliente (passa pela tabela N:N)
SELECT cl.nome AS cliente, COUNT(DISTINCT l.id_lista) AS listas, SUM(p.preco * i.quantidade) AS valor_total
  FROM LCP_CLIENTE cl
  JOIN LCP_LISTA_COMPRA l ON l.id_cliente = cl.id_cliente
  JOIN LCP_ITEM_LISTA i ON i.id_lista = l.id_lista
  JOIN LCP_PRODUTO p ON p.id_produto = i.id_produto
 GROUP BY cl.nome
 ORDER BY valor_total DESC;

-- 5. Produtos em ruptura (estoque zero) por corredor
SELECT c.codigo AS corredor, s.nome AS setor, COUNT(p.id_produto) AS produtos_em_ruptura
  FROM LCP_CORREDOR c
  JOIN LCP_SETOR s ON s.id_setor = c.id_setor
  JOIN LCP_PRODUTO p ON p.id_corredor = c.id_corredor
 WHERE p.estoque = 0
 GROUP BY c.codigo, s.nome
 ORDER BY c.codigo;
