const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Deixa só os números do CNPJ e do telefone
function somenteNumeros(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Verifica os campos obrigatórios do formulário
function validar(dados) {
  const erros = {};
  const cnpj = somenteNumeros(dados.cnpj);
  const telefone = somenteNumeros(dados.telefone);

  if (!dados.nome_empresa) {
    erros.nome_empresa = 'O nome da empresa é obrigatório.';
  }

  if (!cnpj) {
    erros.cnpj = 'O CNPJ é obrigatório.';
  } else if (cnpj.length !== 14) {
    erros.cnpj = 'O CNPJ deve ter 14 dígitos.';
  }

  if (!dados.endereco) {
    erros.endereco = 'O endereço é obrigatório.';
  }

  if (!telefone) {
    erros.telefone = 'O telefone é obrigatório.';
  } else if (telefone.length < 10) {
    erros.telefone = 'O telefone deve ter DDD e número.';
  }

  if (!dados.email) {
    erros.email = 'O e-mail é obrigatório.';
  } else if (!dados.email.includes('@')) {
    erros.email = 'E-mail inválido.';
  }

  if (!dados.contato_principal) {
    erros.contato_principal = 'O contato principal é obrigatório.';
  }

  return erros;
}

// Lista todos os fornecedores
router.get('/', (req, res) => {
  const fornecedores = db.prepare('SELECT * FROM fornecedores ORDER BY nome_empresa').all();

  res.json({ dados: fornecedores });
});

// Busca um fornecedor pelo id
router.get('/:id', (req, res) => {
  const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);

  if (!fornecedor) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  res.json({ dados: fornecedor });
});

// Lista os produtos que este fornecedor fornece
router.get('/:id/produtos', (req, res) => {
  const produtos = db
    .prepare(
      `SELECT produtos.*
         FROM produtos
         JOIN produto_fornecedor ON produto_fornecedor.produto_id = produtos.id
        WHERE produto_fornecedor.fornecedor_id = ?
        ORDER BY produtos.nome`
    )
    .all(req.params.id);

  res.json({ dados: produtos });
});

// Cadastra um novo fornecedor
router.post('/', (req, res) => {
  const erros = validar(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  const cnpj = somenteNumeros(req.body.cnpj);

  // Não pode existir outro fornecedor com o mesmo CNPJ
  const jaExiste = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ?').get(cnpj);

  if (jaExiste) {
    return res.status(409).json({
      mensagem: 'Fornecedor com esse CNPJ já está cadastrado!',
      erros: { cnpj: 'Fornecedor com esse CNPJ já está cadastrado!' },
    });
  }

  const resultado = db
    .prepare(
      `INSERT INTO fornecedores
         (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.body.nome_empresa,
      cnpj,
      req.body.endereco,
      somenteNumeros(req.body.telefone),
      req.body.email,
      req.body.contato_principal
    );

  const fornecedor = db
    .prepare('SELECT * FROM fornecedores WHERE id = ?')
    .get(resultado.lastInsertRowid);

  res.status(201).json({ mensagem: 'Fornecedor cadastrado com sucesso!', dados: fornecedor });
});

// Atualiza um fornecedor
router.put('/:id', (req, res) => {
  const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);

  if (!fornecedor) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  const erros = validar(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  const cnpj = somenteNumeros(req.body.cnpj);

  // O CNPJ pode continuar o mesmo, mas não pode ser de outro fornecedor
  const outro = db
    .prepare('SELECT id FROM fornecedores WHERE cnpj = ? AND id <> ?')
    .get(cnpj, req.params.id);

  if (outro) {
    return res.status(409).json({
      mensagem: 'Fornecedor com esse CNPJ já está cadastrado!',
      erros: { cnpj: 'Fornecedor com esse CNPJ já está cadastrado!' },
    });
  }

  db.prepare(
    `UPDATE fornecedores
        SET nome_empresa = ?, cnpj = ?, endereco = ?,
            telefone = ?, email = ?, contato_principal = ?
      WHERE id = ?`
  ).run(
    req.body.nome_empresa,
    cnpj,
    req.body.endereco,
    somenteNumeros(req.body.telefone),
    req.body.email,
    req.body.contato_principal,
    req.params.id
  );

  const atualizado = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);

  res.json({ mensagem: 'Fornecedor atualizado com sucesso!', dados: atualizado });
});

// Exclui um fornecedor (as associações dele saem junto)
router.delete('/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  res.json({ mensagem: 'Fornecedor removido com sucesso!' });
});

module.exports = router;
