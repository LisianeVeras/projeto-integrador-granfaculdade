const express = require('express');
const cors = require('cors');

const { criarTabelas } = require('./database');
const { popularSeVazio } = require('./seed');

const fornecedores = require('./controllers/fornecedores');
const produtos = require('./controllers/produtos');
const associacoes = require('./controllers/associacoes');

criarTabelas();

// O servidor da nuvem apaga os arquivos quando reinicia, então o banco
// se popula sozinho para o sistema nunca ficar vazio
popularSeVazio();

const app = express();

// Libera o acesso do frontend, que roda em outro endereço
app.use(cors());
app.use(express.json());

// Serve para conferir rapidamente se a API está no ar
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Sistema de Gestão de Estoque - Projeto Integrador',
    rotas: ['/api/fornecedores', '/api/produtos', '/api/associacoes'],
  });
});

app.use('/api/fornecedores', fornecedores);
app.use('/api/produtos', produtos);
app.use('/api/associacoes', associacoes);

module.exports = app;
