Leroy Co-Piloto: O Waze do Varejo

Projeto Acadêmico / Challenge Leroy Merlin

Solução ecossistêmica focada em colaboração, gamificação e conexão humana para lojas de grande formato.

Sobre o Projeto

O Leroy Co-Piloto não busca substituir o atendimento humano por telas complexas, mas sim utilizar a tecnologia para empoderar o assessor de vendas e transformar o cliente no principal auditor de estoque da loja de forma orgânica.

A solução divide-se em duas grandes experiências:

Modo Missão (Cliente): Rota inteligente de compras guiada por geolocalização in-store e o botão de feedback rápido "Não Achei".

Modo Consultor (Vendedor): Painel em tempo real com match do perfil do cliente, transformando o "apontador de prateleiras" em um consultor VIP.

Identidade Visual (Leroy Merlin)

O front-end do MVP foi planejado para refletir a identidade visual oficial da marca

Stack Tecnológica e Conceitos Aplicados (MVP)

O projeto integra conceitos fundamentais aprendidos na graduação:

Front-End:

React (Componentes Funcionais): Para alternar dinamicamente entre as visões do cliente e do vendedor.

HTML5, CSS3 / SASS: Estilização modularizada e variáveis de cores.

Bootstrap: Garantindo responsividade ágil para dispositivos móveis (smartphones dos clientes e coletores dos vendedores).

Back-End e Lógica:

Java (Spring Boot): Aplicação de POO (Programação Orientada a Objetos) estrita, utilizando Records para transferência de dados (DTOs) e Enumerações (Enums) para status de chamados.

Estruturas de Dados: Uso de Filas (Queues) para o gerenciamento da ordem de atendimento dos chamados de ruptura e Listas Lineares para a rota inteligente.

Banco de Dados e Persistência:

Modelagem relacional normalizada (3ª Forma Normal) garantindo integridade referencial e cardinalidade correta (ex: Lojas, Produtos, Clientes e Vendedores).

Comandos DDL e DML, além de consultas com JOINs e Agrupamentos (GROUP BY) para relatórios operacionais.

Funcionalidades Principais do MVP

Rota Inteligente: Ordenação lógica dos itens do carrinho baseada no mapeamento de corredores, reduzindo a fadiga do cliente.

Crowdsourced Audit ("Não Achei"): O cliente reporta gôndolas vazias com um clique, gerando um evento assíncrono para o sistema.

Matchmaking de Vendedores: O sistema direciona o chamado e o perfil do cliente para o assessor mais próximo, ativando o atendimento consultivo.

Placas QR dos Corredores: Cada placa aponta para um link como `https://SEU-SITE/?corredor=A03`. A câmera do celular abre o link, o app registra em qual corredor o cliente está e recalcula a rota a partir dali, sem precisar de leitor dentro do app.

Como usar as Placas QR

Publique o site e abra a aba "Placas QR" pelo endereço publicado: os códigos usam o endereço em que a página foi aberta, então placas geradas em `localhost` não funcionam no celular. Depois é só imprimir e colar cada placa no seu corredor.

Para testar com a câmera antes de publicar, rode `npm run dev`, abra no computador o endereço "Network" mostrado no terminal e leia o QR com um celular na mesma rede Wi-Fi. Para testar sem celular, use o botão "Simular leitura" de cada placa.

A demonstração fica salva no navegador e é compartilhada entre as abas dele. Para voltar ao início, use "Reiniciar demonstração" no rodapé.

Como publicar na Vercel

Na pasta do projeto, rode `npx vercel login` e depois `npx vercel --prod`, aceitando as opções sugeridas: a Vercel detecta o Vite sozinha e o projeto não precisa de variáveis de ambiente.

Gere as placas pelo domínio curto de produção (`nome-do-projeto.vercel.app`), que continua o mesmo a cada novo deploy. Não use os endereços com código aleatório: eles mudam a cada publicação e podem exigir login na Vercel. Para atualizar o site depois, rode `npx vercel --prod` de novo: as placas impressas continuam valendo.


👥 Equipe

Desenvolvimento: Projeto acadêmico desenvolvido para a entrega do semestre com foco em inovação no varejo e engenharia de software aplicada.
