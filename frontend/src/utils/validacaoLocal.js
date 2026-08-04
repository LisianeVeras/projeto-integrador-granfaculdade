// Confere os campos obrigatórios antes de enviar o formulário para o backend

const OBRIGATORIOS_FORNECEDOR = {
  nome_empresa: 'O nome da empresa é obrigatório.',
  cnpj: 'O CNPJ é obrigatório.',
  endereco: 'O endereço é obrigatório.',
  telefone: 'O telefone é obrigatório.',
  email: 'O e-mail é obrigatório.',
  contato_principal: 'O contato principal é obrigatório.',
};

const OBRIGATORIOS_PRODUTO = {
  nome: 'O nome do produto é obrigatório.',
  descricao: 'A descrição é obrigatória.',
  categoria: 'A categoria é obrigatória.',
};

function checar(dados, regras) {
  const erros = {};

  for (const campo in regras) {
    if (!dados[campo]) erros[campo] = regras[campo];
  }

  return erros;
}

export function validarFornecedorLocal(dados) {
  return checar(dados, OBRIGATORIOS_FORNECEDOR);
}

export function validarProdutoLocal(dados) {
  return checar(dados, OBRIGATORIOS_PRODUTO);
}
