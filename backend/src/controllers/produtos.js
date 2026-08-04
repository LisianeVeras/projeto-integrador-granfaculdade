const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Categorias aceitas no cadastro
const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Vestuário',
  'Eletrônicos',
  'Higiene e Limpeza',
  'Papelaria',
  'Outros',
];

// Deixa só os números do código de barras
function somenteNumeros(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Verifica os campos obrigatórios do formulário
function validar(dados) {
  const erros = {};

  if (!dados.nome) {
    erros.nome = 'O nome do produto é obrigatório.';
  }

  if (!dados.descricao) {
    erros.descricao = 'A descrição é obrigatória.';
  }

  if (!dados.categoria) {
    erros.categoria = 'A categoria é obrigatória.';
  } else if (!CATEGORIAS.includes(dados.categoria)) {
    erros.categoria = 'Categoria inválida.';
  }

  if (dados.preco && Number(dados.preco) < 0) {
    erros.preco = 'O preço não pode ser negativo.';
  }

  if (dados.quantidade_estoque && Number(dados.quantidade_estoque) < 0) {
    erros.quantidade_estoque = 'A quantidade não pode ser negativa.';
  }

  return erros;
}

// Lista todos os produtos
router.get('/', (req, res) => {
  const produtos = db.prepare('SELECT * FROM produtos ORDER BY nome').all();

  res.json({ dados: produtos });
});

// Busca um produto pelo id
router.get('/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);

  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  res.json({ dados: produto });
});

// Lista os fornecedores deste produto
router.get('/:id/fornecedores', (req, res) => {
  const fornecedores = db
    .prepare(
      `SELECT fornecedores.*
         FROM fornecedores
         JOIN produto_fornecedor ON produto_fornecedor.fornecedor_id = fornecedores.id
        WHERE produto_fornecedor.produto_id = ?
        ORDER BY fornecedores.nome_empresa`
    )
    .all(req.params.id);

  res.json({ dados: fornecedores });
});

// Cadastra um novo produto
router.post('/', (req, res) => {
  const erros = validar(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  // O código de barras não é obrigatório, então pode ficar vazio no banco
  const codigoBarras = req.body.codigo_barras ? somenteNumeros(req.body.codigo_barras) : null;

  if (codigoBarras) {
    const jaExiste = db
      .prepare('SELECT id FROM produtos WHERE codigo_barras = ?')
      .get(codigoBarras);

    if (jaExiste) {
      return res.status(409).json({
        mensagem: 'Produto com este código de barras já está cadastrado!',
        erros: { codigo_barras: 'Produto com este código de barras já está cadastrado!' },
      });
    }
  }

  const resultado = db
    .prepare(
      `INSERT INTO produtos
         (nome, codigo_barras, descricao, preco, quantidade_estoque,
          categoria, data_validade, imagem_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.body.nome,
      codigoBarras,
      req.body.descricao,
      Number(req.body.preco) || 0,
      Number(req.body.quantidade_estoque) || 0,
      req.body.categoria,
      req.body.data_validade || null,
      req.body.imagem_url || null
    );

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(resultado.lastInsertRowid);

  res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', dados: produto });
});

// Atualiza um produto
router.put('/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);

  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  const erros = validar(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  const codigoBarras = req.body.codigo_barras ? somenteNumeros(req.body.codigo_barras) : null;

  if (codigoBarras) {
    const outro = db
      .prepare('SELECT id FROM produtos WHERE codigo_barras = ? AND id <> ?')
      .get(codigoBarras, req.params.id);

    if (outro) {
      return res.status(409).json({
        mensagem: 'Produto com este código de barras já está cadastrado!',
        erros: { codigo_barras: 'Produto com este código de barras já está cadastrado!' },
      });
    }
  }

  db.prepare(
    `UPDATE produtos
        SET nome = ?, codigo_barras = ?, descricao = ?, preco = ?,
            quantidade_estoque = ?, categoria = ?, data_validade = ?, imagem_url = ?
      WHERE id = ?`
  ).run(
    req.body.nome,
    codigoBarras,
    req.body.descricao,
    Number(req.body.preco) || 0,
    Number(req.body.quantidade_estoque) || 0,
    req.body.categoria,
    req.body.data_validade || null,
    req.body.imagem_url || null,
    req.params.id
  );

  const atualizado = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);

  res.json({ mensagem: 'Produto atualizado com sucesso!', dados: atualizado });
});

// Exclui um produto (as associações dele saem junto)
router.delete('/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  res.json({ mensagem: 'Produto removido com sucesso!' });
});

module.exports = router;
