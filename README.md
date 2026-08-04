# Projeto Integrador — Sistema de Gestão de Estoque

Projeto da disciplina Projeto Integrador. É um sistema web para controlar o estoque de uma empresa,
onde é possível cadastrar fornecedores, cadastrar produtos e associar os fornecedores aos produtos.

Um produto pode ter vários fornecedores e um fornecedor pode fornecer vários produtos.

## Tecnologias

- **Frontend:** React (Vite) e React Router
- **Backend:** Node.js com Express
- **Banco de dados:** SQLite

## Como rodar o projeto

É preciso ter o Node.js instalado. O projeto roda em dois terminais.

**Terminal 1 — backend**

```
cd backend
npm install
npm run seed
npm run dev
```

O servidor sobe em http://localhost:3001

**Terminal 2 — frontend**

```
cd frontend
npm install
npm run dev
```

O site abre em http://localhost:5173

O comando `npm run seed` é opcional e serve para o sistema já começar com alguns fornecedores e
produtos cadastrados. Ele apaga o que estiver no banco antes de inserir os exemplos.

## Telas

- **Fornecedores** — cadastro, edição e exclusão de fornecedores
- **Produtos** — cadastro, edição e exclusão de produtos
- **Associação** — liga fornecedores a um produto e mostra quem já está associado

## Rotas da API

Todas começam com http://localhost:3001/api

| Método | Rota | O que faz |
|---|---|---|
| GET | /fornecedores | Lista os fornecedores |
| GET | /fornecedores/:id | Busca um fornecedor |
| POST | /fornecedores | Cadastra um fornecedor |
| PUT | /fornecedores/:id | Altera um fornecedor |
| DELETE | /fornecedores/:id | Exclui um fornecedor |
| GET | /fornecedores/:id/produtos | Produtos desse fornecedor |
| GET | /produtos | Lista os produtos |
| GET | /produtos/:id | Busca um produto |
| POST | /produtos | Cadastra um produto |
| PUT | /produtos/:id | Altera um produto |
| DELETE | /produtos/:id | Exclui um produto |
| GET | /produtos/:id/fornecedores | Fornecedores desse produto |
| GET | /associacoes | Lista as associações |
| POST | /associacoes | Associa um fornecedor a um produto |
| DELETE | /associacoes/:produtoId/:fornecedorId | Desfaz a associação |

## Banco de dados

São três tabelas:

- `fornecedores` — dados da empresa fornecedora (o CNPJ não pode repetir)
- `produtos` — dados do produto (o código de barras não pode repetir)
- `produto_fornecedor` — liga um produto a um fornecedor

A tabela `produto_fornecedor` é necessária porque a relação entre produtos e fornecedores é de
muitos para muitos, então não daria para resolver com uma coluna só em uma das tabelas.

O banco fica no arquivo `backend/estoque.db`, que é criado sozinho na primeira vez que o backend roda.
