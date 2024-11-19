const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3000;

// URL base do servidor Railway
const RAILWAY_BASE_URL = 'https://servidorteste-production.up.railway.app';

// Função para montar a URL completa
function gerarUrl() {
  return `${RAILWAY_BASE_URL}/api/armazenar_mensagem_get`;
}

// Middleware para lidar com o proxy
app.use('/api', (req, res) => {
  const mensagem = req.query.mensagem;

  if (!mensagem) {
    res.status(400).send("Erro: Parâmetro 'mensagem' é obrigatório.");
    return;
  }

  // Monta a URL de destino
  const urlDestino = gerarUrl();
  console.log(`URL gerada: ${urlDestino}`);

  // Configura o proxy para enviar apenas a mensagem como query parameter
  proxy.web(
    req,
    res,
    {
      target: urlDestino,
      changeOrigin: true,
      selfHandleResponse: false,
      onProxyReq: (proxyReq, req, res) => {
        // Ajusta o caminho da requisição para incluir somente o valor de 'mensagem'
        proxyReq.path = `/api/armazenar_mensagem_get?mensagem=${mensagem}`;
      },
    },
    (err) => {
      console.error(`Erro ao redirecionar para o Railway: ${err.message}`);
      res.status(500).send("Erro interno ao processar a requisição.");
    }
  );
});

// Rota de verificação
app.get('/', (req, res) => {
  res.send('Servidor Proxy funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor Proxy rodando na porta ${PORT}`);
});
