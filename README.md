Leroy Co-Piloto: O Waze do Varejo 🛒

Projeto Acadêmico / Challenge Leroy Merlin

Solução ecossistêmica focada em colaboração, gamificação e conexão humana para lojas de grande formato.

💡 Sobre o Projeto

O Leroy Co-Piloto utiliza a tecnologia para humanizar o atendimento, empoderando o assessor de vendas e transformando o cliente no principal auditor de estoque da loja.

A solução divide-se em duas grandes experiências:

Modo Missão (Cliente): Experiência de compra guiada por geolocalização e inteligência artificial para otimização de trajeto, além do botão de feedback rápido "Não Achei".

Modo Consultor (Vendedor): Painel em tempo real com match do perfil do cliente, transformando o "apontador de prateleiras" em um consultor VIP.

🤖 O Papel da Inteligência Artificial

A inteligência artificial do sistema atua diretamente na jornada do cliente através de duas frentes principais:

Otimização de Rota: A IA calcula o trajeto mais eficiente dentro da loja com base na lista de compras, evitando idas e vindas desnecessárias pelos corredores.

Organização Inteligente de Materiais: A IA estrutura a ordem dos itens pensando na ergonomia e segurança do transporte, organizando a lista de forma inteligente — por exemplo, sugerindo recolher primeiro os materiais mais pesados (como pisos e argamassa) e por último os mais leves.

📍 Placas QR dos Corredores (Geolocalização In-Store)
Para garantir precisão sem depender de GPS interno instável:

Escaneamento Rápido: Cada corredor da loja possui placas com QR Codes exclusivos.

Recálculo Instantâneo: Ao apontar a câmera do celular para a placa do corredor, o sistema recalcula a rota a partir daquele ponto. O cliente também pode pedir que a IA otimize o trajeto a partir dali.

Conexão com o Vendedor: Ao tocar em "Não Achei", o assessor de vendas mais próximo recebe o chamado com o corredor em que o cliente está, facilitando o encontro para um atendimento consultivo.

🚀 Funcionalidades Principais

Rota Inteligente: Ordenação lógica e ergonômica dos produtos no carrinho.

Crowdsourced Audit ("Não Achei"): O cliente reporta gôndolas vazias com um clique, acionando auditoria imediata.

Matchmaking de Vendedores: O sistema direciona o chamado e o contexto do cliente para o assessor mais próximo.


👥 Equipe e Autoria

Ana Clara Maciel, João Felipe Bertini e João Luis Pezzuol

Desenvolvimento: Projeto acadêmico desenvolvido para a entrega do semestre com foco em inovação no varejo físico.

🌐 Acesse o site

https://leroy-co-piloto.vercel.app

💻 Como rodar o site

1. Entre na pasta: cd leroy-co-piloto
2. Instale as dependências: npm install
3. Copie o arquivo .env.example para .env e preencha OPENROUTER_API_KEY. Sem a chave, a rota usa só as regras locais, sem IA.
4. Inicie: npm run dev
5. Abra http://localhost:3000

☕ Back-end e banco de dados

Aplicação de console em Java com JDBC e banco Oracle, separada do site. O passo a passo está em backend/README.md. Os scripts do banco ficam em sql/ e os diagramas em diagramas/.
