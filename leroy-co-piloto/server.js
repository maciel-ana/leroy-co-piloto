import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import statusOpenRouter from './api/openrouter-status.js';
import otimizarRota from './api/optimize-route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// As mesmas funções publicadas na Vercel, para o ambiente local se comportar igual
app.all('/api/openrouter-status', statusOpenRouter);
app.all('/api/optimize-route', otimizarRota);

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
