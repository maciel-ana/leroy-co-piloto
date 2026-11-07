// GET /api/openrouter-status: informa à tela se a otimização vai usar IA ou só as regras locais
export default function statusOpenRouter(_req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  res.status(200).json({
    configured: isConfigured,
    model,
    provider: 'OpenRouter AI',
    message: isConfigured
      ? `OpenRouter conectado e ativo com o modelo ${model}.`
      : 'OpenRouter sem chave: a otimização usa só as regras locais.'
  });
}
