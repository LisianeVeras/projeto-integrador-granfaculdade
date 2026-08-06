const app = require('./app');

// Na nuvem a porta é definida pelo servidor de hospedagem.
// Quando roda no computador, usa a 3001.
const PORTA = process.env.PORT || 3001;

app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
