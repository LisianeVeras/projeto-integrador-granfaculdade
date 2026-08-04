// Coloca alguns dados de exemplo no banco, para o sistema não começar vazio.
// Rode com: npm run seed
// Atenção: este arquivo apaga o que já estiver cadastrado.

const { db, criarTabelas } = require('./database');

criarTabelas();

db.prepare('DELETE FROM produto_fornecedor').run();
db.prepare('DELETE FROM produtos').run();
db.prepare('DELETE FROM fornecedores').run();
db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('fornecedores', 'produtos', 'produto_fornecedor')").run();

const inserirFornecedor = db.prepare(
  `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
   VALUES (?, ?, ?, ?, ?, ?)`
);

inserirFornecedor.run(
  'Distribuidora São Paulo Ltda',
  '11222333000181',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  '1133334444',
  'contato@distribuidorasp.com.br',
  'Carlos Almeida'
);

inserirFornecedor.run(
  'Atacado Minas Comércio S.A.',
  '45356786000112',
  'Rua da Bahia, 250 - Centro, Belo Horizonte - MG',
  '3132225555',
  'vendas@atacadominas.com.br',
  'Fernanda Rocha'
);

inserirFornecedor.run(
  'Sul Importadora EIRELI',
  '04987654000101',
  'Rua dos Andradas, 780 - Centro, Porto Alegre - RS',
  '5133217788',
  'comercial@sulimportadora.com.br',
  'Roberto Menezes'
);

const inserirProduto = db.prepare(
  `INSERT INTO produtos
     (nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

inserirProduto.run(
  'Arroz Integral 1kg',
  '7891234567895',
  'Arroz integral tipo 1, pacote de 1kg, rico em fibras.',
  8.9,
  150,
  'Alimentos',
  '2027-06-30'
);

inserirProduto.run(
  'Café Torrado e Moído 500g',
  '7899876543210',
  'Café torrado e moído tradicional, embalagem a vácuo de 500g.',
  18.5,
  80,
  'Alimentos',
  '2026-12-31'
);

inserirProduto.run(
  'Camiseta Básica Algodão',
  '7890001112223',
  'Camiseta unissex 100% algodão, gola careca, do P ao GG.',
  39.9,
  45,
  'Vestuário',
  null
);

inserirProduto.run(
  'Fone de Ouvido Bluetooth',
  '7894445556667',
  'Fone intra-auricular sem fio, Bluetooth 5.0, com estojo carregador.',
  129.9,
  22,
  'Eletrônicos',
  null
);

// Este produto fica sem código de barras de propósito, porque o campo é opcional
inserirProduto.run(
  'Caderno Universitário 200 folhas',
  null,
  'Caderno espiral universitário, 10 matérias, 200 folhas pautadas.',
  24.0,
  60,
  'Papelaria',
  null
);

const associar = db.prepare(
  'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)'
);

// O produto 1 tem dois fornecedores e o fornecedor 1 fornece dois produtos
associar.run(1, 1);
associar.run(1, 2);
associar.run(2, 1);
associar.run(4, 3);

console.log('Banco populado com 3 fornecedores, 5 produtos e 4 associações.');
