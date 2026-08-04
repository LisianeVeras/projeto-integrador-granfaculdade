const express = require('express');
const cors = require('cors');

const { criarTabelas } = require('./database');

const fornecedores = require('./controllers/fornecedores');
const produtos = require('./controllers/produtos');
const associacoes = require('./controllers/associacoes');

criarTabelas();

const app = express();

// Libera o acesso do frontend, que roda em outra porta
app.use(cors());
app.use(express.json());

app.use('/api/fornecedores', fornecedores);
app.use('/api/produtos', produtos);
app.use('/api/associacoes', associacoes);

module.exports = app;
