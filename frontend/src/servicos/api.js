// Todas as chamadas ao backend passam por aqui

const BASE = 'http://localhost:3001/api';

// Erro com o status e os erros de cada campo que o backend devolveu
export class ErroApi extends Error {
  constructor(mensagem, status, erros) {
    super(mensagem);
    this.status = status;
    this.erros = erros || {};
  }
}

async function requisicao(rota, opcoes = {}) {
  let resposta;

  try {
    resposta = await fetch(BASE + rota, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    // Acontece quando o servidor está desligado
    throw new ErroApi(
      'Não foi possível falar com o servidor. Confira se o backend está rodando em http://localhost:3001.',
      0
    );
  }

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new ErroApi(corpo.mensagem || 'Ocorreu um erro.', resposta.status, corpo.erros);
  }

  return corpo;
}

export const fornecedores = {
  listar: () => requisicao('/fornecedores'),
  criar: (dados) => requisicao('/fornecedores', { method: 'POST', corpo: dados }),
  atualizar: (id, dados) => requisicao(`/fornecedores/${id}`, { method: 'PUT', corpo: dados }),
  remover: (id) => requisicao(`/fornecedores/${id}`, { method: 'DELETE' }),
  produtos: (id) => requisicao(`/fornecedores/${id}/produtos`),
};

export const produtos = {
  listar: () => requisicao('/produtos'),
  criar: (dados) => requisicao('/produtos', { method: 'POST', corpo: dados }),
  atualizar: (id, dados) => requisicao(`/produtos/${id}`, { method: 'PUT', corpo: dados }),
  remover: (id) => requisicao(`/produtos/${id}`, { method: 'DELETE' }),
  fornecedores: (id) => requisicao(`/produtos/${id}/fornecedores`),
};

export const associacoes = {
  listar: () => requisicao('/associacoes'),
  associar: (produtoId, fornecedorId) =>
    requisicao('/associacoes', {
      method: 'POST',
      corpo: { produto_id: produtoId, fornecedor_id: fornecedorId },
    }),
  desassociar: (produtoId, fornecedorId) =>
    requisicao(`/associacoes/${produtoId}/${fornecedorId}`, { method: 'DELETE' }),
};
