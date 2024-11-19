const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = process.env.PORT || 3000;

const RAILWAY_BASE_URL = 'https://servidorteste-production.up.railway.app';

function gerarUrl(mensagem) {
  if (!mensagem) {
    console.error("Parâmetro 'mensagem' está vazio ou ausente.");
    return null;
  }
  return `${RAILWAY_BASE_URL}/api/armazenar_mensagem_get?mensagem=${mensagem}`;
}

app.set('trust proxy', true); // Ajuste importante!

app.use('/api', (req, res) => {
  const mensagem = req.query.mensagem;

  const urlFormada = gerarUrl(mensagem);

  if (!urlFormada) {
    res.status(400).send("Erro: Parâmetro 'mensagem' é obrigatório.");
    return;
  }

  console.log(`URL gerada: ${urlFormada}`);

  proxy.web(req, res, { target: urlFormada, changeOrigin: true }, (err) => {
    console.error(`Erro ao redirecionar para o Railway: ${err.message}`);
    res.status(500).send("Erro interno ao processar a requisição.");
  });
});

app.get('/', (req, res) => {
  res.send('Servidor Proxy funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor Proxy rodando na porta ${PORT}`);
});
