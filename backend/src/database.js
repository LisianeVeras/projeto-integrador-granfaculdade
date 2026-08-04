const path = require('path');
const Database = require('better-sqlite3');

// O banco fica no arquivo estoque.db, dentro da pasta backend
const db = new Database(path.join(__dirname, '..', 'estoque.db'));

// Liga as chaves estrangeiras (o SQLite vem com elas desligadas)
db.pragma('foreign_keys = ON');

// Cria as tabelas quando o projeto roda pela primeira vez
function criarTabelas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_empresa      TEXT NOT NULL,
      cnpj              TEXT NOT NULL UNIQUE,
      endereco          TEXT NOT NULL,
      telefone          TEXT NOT NULL,
      email             TEXT NOT NULL,
      contato_principal TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      nome               TEXT NOT NULL,
      codigo_barras      TEXT UNIQUE,
      descricao          TEXT NOT NULL,
      preco              REAL NOT NULL DEFAULT 0,
      quantidade_estoque INTEGER NOT NULL DEFAULT 0,
      categoria          TEXT NOT NULL,
      data_validade      TEXT,
      imagem_url         TEXT
    );

    CREATE TABLE IF NOT EXISTS produto_fornecedor (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id    INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,

      FOREIGN KEY (produto_id)    REFERENCES produtos(id)     ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE,

      UNIQUE (produto_id, fornecedor_id)
    );
  `);
}

module.exports = { db, criarTabelas };
