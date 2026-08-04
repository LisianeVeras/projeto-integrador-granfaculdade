const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Lista todas as associações entre produtos e fornecedores
router.get('/', (req, res) => {
  const associacoes = db
    .prepare(
      `SELECT produto_fornecedor.id,
              produto_fornecedor.produto_id,
              produto_fornecedor.fornecedor_id,
              produtos.nome         AS produto_nome,
              fornecedores.nome_empresa AS fornecedor_nome
         FROM produto_fornecedor
         JOIN produtos     ON produtos.id = produto_fornecedor.produto_id
         JOIN fornecedores ON fornecedores.id = produto_fornecedor.fornecedor_id
        ORDER BY produtos.nome`
    )
    .all();

  res.json({ dados: associacoes });
});

// Associa um fornecedor a um produto
router.post('/', (req, res) => {
  const produtoId = Number(req.body.produto_id);
  const fornecedorId = Number(req.body.fornecedor_id);

  if (!produtoId || !fornecedorId) {
    return res.status(400).json({ mensagem: 'Selecione um produto e um fornecedor.' });
  }

  const produto = db.prepare('SELECT id FROM produtos WHERE id = ?').get(produtoId);

  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  const fornecedor = db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(fornecedorId);

  if (!fornecedor) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  // O mesmo fornecedor não pode ser associado duas vezes ao mesmo produto
  const jaAssociado = db
    .prepare('SELECT id FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
    .get(produtoId, fornecedorId);

  if (jaAssociado) {
    return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  }

  db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(
    produtoId,
    fornecedorId
  );

  res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
});

// Desassocia um fornecedor de um produto
router.delete('/:produtoId/:fornecedorId', (req, res) => {
  const resultado = db
    .prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
    .run(req.params.produtoId, req.params.fornecedorId);

  if (resultado.changes === 0) {
    return res.status(404).json({ mensagem: 'Este fornecedor não está associado a este produto!' });
  }

  res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
});

module.exports = router;
