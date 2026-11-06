import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { distanciaEntreCorredores } from './src/services/routeEngine.js';
import { classificarCarga, pesoDaCarga } from './src/services/cargaProduto.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

const ROTULO_CARGA = { PESADA: 'Pesado', MEDIA: 'Longo/Médio', LEVE: 'Leve' };

// Helper heurístico inteligente com ergonomia e menor percurso
function ordenarRotaComErgonomia(itensPendentes, corredorAtual) {
  if (!itensPendentes || itensPendentes.length <= 1) return itensPendentes;

  const lista = [...itensPendentes];

  // Se o cliente já está em um corredor conhecido, calcula pelo mais próximo
  if (corredorAtual) {
    let posicao = corredorAtual;
    const resultado = [];
    const restantes = [...lista];

    while (restantes.length > 0) {
      const maisProximo = restantes.reduce((melhor, item) => {
        const dItem = distanciaEntreCorredores(posicao, item.produto.corredor);
        const dMelhor = distanciaEntreCorredores(posicao, melhor.produto.corredor);
        if (dItem !== dMelhor) {
          return dItem < dMelhor ? item : melhor;
        }
        // Desempate por peso (pesado primeiro para estabilidade do carrinho)
        return pesoDaCarga(item.produto) > pesoDaCarga(melhor.produto) ? item : melhor;
      });

      restantes.splice(restantes.indexOf(maisProximo), 1);
      resultado.push(maisProximo);
      posicao = maisProximo.produto.corredor;
    }

    return resultado;
  }

  // Sem corredor definido (início da loja): começa pelos corredores com a carga mais
  // pesada e pega tudo de cada corredor de uma vez, para não voltar aonde já passou
  const pesoDoCorredor = new Map();
  for (const { produto } of lista) {
    pesoDoCorredor.set(
      produto.corredor,
      Math.max(pesoDoCorredor.get(produto.corredor) ?? 0, pesoDaCarga(produto))
    );
  }

  return lista.sort((a, b) => {
    const diferencaCorredor = pesoDoCorredor.get(b.produto.corredor) - pesoDoCorredor.get(a.produto.corredor);
    if (diferencaCorredor !== 0) return diferencaCorredor;
    if (a.produto.corredor !== b.produto.corredor) {
      return a.produto.corredor.localeCompare(b.produto.corredor);
    }
    const diferencaItem = pesoDaCarga(b.produto) - pesoDaCarga(a.produto);
    if (diferencaItem !== 0) return diferencaItem;
    if (a.produto.ordemCorredor !== b.produto.ordemCorredor) {
      return a.produto.ordemCorredor - b.produto.ordemCorredor;
    }
    return a.produto.nome.localeCompare(b.produto.nome);
  });
}

// Resumo e dicas escritos a partir da rota calculada, para só citar o que existe nela
function descreverRotaLocal(rota, corredorAtual) {
  const corredoresDe = (itens) => [...new Set(itens.map(i => i.produto.corredor))];
  const trajeto = corredoresDe(rota).join(' → ');
  const pesados = rota.filter(i => classificarCarga(i.produto) === 'PESADA');
  const corredoresPesados = corredoresDe(pesados).join(', ');
  const temLeves = rota.some(i => classificarCarga(i.produto) === 'LEVE');

  const dicas = [];
  if (pesados.length === 0) {
    dicas.push('Esta lista não tem itens pesados, então o carrinho não exige uma ordem especial.');
  } else if (classificarCarga(rota[0].produto) === 'PESADA') {
    dicas.push(`Pegue primeiro os itens pesados (${corredoresPesados}) e deixe-os no fundo do carrinho.`);
  } else {
    dicas.push(`Deixe espaço no fundo do carrinho para os itens pesados (${corredoresPesados}), que vêm depois de outros.`);
  }
  if (pesados.length > 0 && temLeves) {
    dicas.push('Mantenha os itens leves por cima dos pesados para não danificá-los.');
  }

  return {
    resumoEstrategia: corredorAtual
      ? `Partindo do Corredor ${corredorAtual}, a rota vai sempre para o corredor mais próximo: ${trajeto}.`
      : `A rota começa pelos corredores com mais carga: ${trajeto}.`,
    dicas
  };
}

// 1. Endpoint: Status do OpenRouter
app.get('/api/openrouter-status', (_req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  res.json({
    configured: isConfigured,
    model,
    provider: 'OpenRouter AI',
    message: isConfigured
      ? `OpenRouter conectado e ativo com o modelo ${model}.`
      : 'OpenRouter em modo simulado (configure OPENROUTER_API_KEY no arquivo .env para chamadas em nuvem).'
  });
});

// 2. Endpoint: Otimização de Rota com IA (OpenRouter)
app.post('/api/optimize-route', async (req, res) => {
  try {
    const { itens = [], localizacao = null, perfilProjeto = 'REFORMA_BANHEIRO' } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Nenhum item na lista para otimizar.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

    const coletados = itens.filter(i => i.coletado);
    const pendentes = itens.filter(i => !i.coletado);

    if (pendentes.length <= 1) {
      return res.json({
        success: true,
        source: 'direto',
        model: 'Otimização Direta',
        itensOrdenados: itens,
        resumoEstrategia: 'Com 1 ou nenhum item pendente, a rota já se encontra no trajeto direto.',
        dicas: ['Você já coletou praticamente todos os itens ou possui apenas uma parada restante.']
      });
    }

    const corredorAtual = localizacao?.corredor || null;

    // Tenta chamar a API da OpenRouter se a chave estiver configurada
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const systemPrompt = `Você é o assistente inteligente de roteirização física da Leroy Merlin Brasil.
Sua missão é ordenar os itens de compra pendentes do cliente para otimizar a caminhada dentro da megaloja física.

ESTRUTURA DA LOJA LEROY MERLIN:
- Setor A: Construção Pesada & Hidráulica (Corredores A01, A02, A03)
- Setor B: Elétrica & Iluminação (Corredores B01, B02, B03)
- Setor C: Tintas & Acabamento (Corredores C01, C02)
- Setor D: Ferramentas & Bricolagem (Corredores D01, D04)
Todos os corredores dão acesso à Circulação Central.

CRITÉRIOS OBRIGATÓRIOS:
1. Ponto de Início: Se "corredorAtual" for informado, o cliente já está nele; comece por itens nesse corredor ou no corredor adjacente mais próximo. Se for nulo, comece pela entrada da loja (Setor A/B).
2. Agrupamento: Nunca faça o cliente ir e voltar entre setores opostos (ex: Setor A para D e depois voltar para A). Agrupe itens do mesmo corredor e do mesmo setor.
3. Ergonomia do Carrinho:
   - Materiais pesados (argamassas 20kg, latas de tinta 18L, tubos de 3m) devem ser carregados primeiro para ficar no fundo do carrinho.
   - Itens leves, pequenos ou frágeis (lâmpadas LED, trenas, disjuntores, acabamentos) devem ser coletados por último para não serem danificados ou soterrados no carrinho.
4. Responda ESTRITAMENTE em formato JSON compatível:
{
  "sequenciaItemIds": ["id1", "id2", ...],
  "resumoEstrategia": "Breve resumo amigável em 1 ou 2 frases da estratégia adotada.",
  "dicas": [
    "Dica ergonômica sobre peso/carrinho",
    "Dica prática sobre os corredores ou uso de ferramentas"
  ]
}`;

        const userPrompt = JSON.stringify({
          corredorAtual,
          perfilProjeto,
          itensPendentes: pendentes.map(i => ({
            id: i.id,
            nome: i.produto?.nome,
            sku: i.produto?.sku,
            categoria: i.produto?.categoria,
            corredor: i.produto?.corredor,
            moduloGondola: i.produto?.moduloGondola,
            pesoEstimado: ROTULO_CARGA[classificarCarga(i.produto)],
            quantidade: i.quantidade
          }))
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': 'https://leroy-copiloto.app',
            'X-Title': 'Leroy Co-Piloto'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (openRouterRes.ok) {
          const completion = await openRouterRes.json();
          const content = completion.choices?.[0]?.message?.content;
          if (content) {
            let parsed;
            try {
              parsed = JSON.parse(content);
            } catch {
              const match = content.match(/\{[\s\S]*\}/);
              if (match) parsed = JSON.parse(match[0]);
            }

            if (parsed && Array.isArray(parsed.sequenciaItemIds) && parsed.sequenciaItemIds.length > 0) {
              const mapaItens = new Map(pendentes.map(p => [p.id, p]));
              const reordenados = [];

              for (const id of parsed.sequenciaItemIds) {
                if (mapaItens.has(id)) {
                  reordenados.push(mapaItens.get(id));
                  mapaItens.delete(id);
                }
              }
              for (const restante of mapaItens.values()) {
                reordenados.push(restante);
              }

              // O modelo pode devolver esses campos em outro formato: a tela só recebe texto
              const dicasDaIA = Array.isArray(parsed.dicas)
                ? parsed.dicas.filter(dica => typeof dica === 'string' && dica.trim())
                : [];

              return res.json({
                success: true,
                source: 'openrouter',
                model: completion.model || model,
                itensOrdenados: [...coletados, ...reordenados],
                resumoEstrategia: typeof parsed.resumoEstrategia === 'string' && parsed.resumoEstrategia.trim()
                  ? parsed.resumoEstrategia
                  : 'Trajeto reordenado pela IA com foco em menor deslocamento e ergonomia de carga.',
                dicas: dicasDaIA.length > 0 ? dicasDaIA : descreverRotaLocal(reordenados, corredorAtual).dicas
              });
            }
          }
        } else {
          console.warn('[OpenRouter] Erro na resposta:', openRouterRes.status, await openRouterRes.text());
        }
      } catch (callErr) {
        console.error('[OpenRouter] Falha na requisição:', callErr);
      }
    }

    // Heurística local de alta precisão (usada se OpenRouter não tiver chave ou se falhar)
    const reordenados = ordenarRotaComErgonomia(pendentes, corredorAtual);
    const itensFinais = [...coletados, ...reordenados];

    return res.json({
      success: true,
      source: apiKey ? 'openrouter_fallback' : 'regras_locais',
      model: apiKey ? 'Regras locais, IA indisponível' : 'Regras locais',
      itensOrdenados: itensFinais,
      ...descreverRotaLocal(reordenados, corredorAtual)
    });
  } catch (error) {
    console.error('Erro na rota /api/optimize-route:', error);
    res.status(500).json({ error: 'Erro interno ao otimizar rota.' });
  }
});

// Configuração do Vite em Desenvolvimento vs Produção
async function start() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Leroy Co-Piloto] Servidor rodando em http://0.0.0.0:${PORT}`);
    if (!process.env.OPENROUTER_API_KEY?.trim()) {
      console.log('[OpenRouter] Sem OPENROUTER_API_KEY no .env: a otimização vai usar só as regras locais, sem IA.');
    }
  });
}

start();
