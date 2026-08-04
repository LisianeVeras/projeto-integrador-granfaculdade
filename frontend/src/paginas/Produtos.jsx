import { useEffect, useState } from 'react';

import Alerta from '../componentes/Alerta.jsx';
import CampoTexto from '../componentes/CampoTexto.jsx';
import { ErroApi, produtos as apiProdutos } from '../servicos/api.js';
import { formatarData, formatarMoeda } from '../utils/formatadores.js';
import { validarProdutoLocal } from '../utils/validacaoLocal.js';

const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Vestuário',
  'Eletrônicos',
  'Higiene e Limpeza',
  'Papelaria',
  'Outros',
];

const FORMULARIO_VAZIO = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  preco: '',
  quantidade_estoque: '',
  categoria: '',
  data_validade: '',
  imagem_url: '',
};

export default function Produtos() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function carregarLista() {
    try {
      const resposta = await apiProdutos.listar();
      setLista(resposta.dados);
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLista();
  }, []);

  function alterarCampo(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor });
    setErros({ ...erros, [campo]: undefined });
  }

  function limparFormulario() {
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setEditandoId(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setAlerta(null);

    // Confere os campos obrigatórios antes de chamar o backend
    const errosLocais = validarProdutoLocal(formulario);

    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      setAlerta({ tipo: 'erro', texto: 'Preencha os campos obrigatórios destacados.' });
      return;
    }

    setEnviando(true);

    try {
      const resposta = editandoId
        ? await apiProdutos.atualizar(editandoId, formulario)
        : await apiProdutos.criar(formulario);

      setAlerta({ tipo: 'sucesso', texto: resposta.mensagem });
      limparFormulario();
      await carregarLista();
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });

      if (erro instanceof ErroApi) setErros(erro.erros);
    } finally {
      setEnviando(false);
    }
  }

  function editar(produto) {
    setFormulario({
      nome: produto.nome,
      codigo_barras: produto.codigo_barras || '',
      descricao: produto.descricao,
      preco: produto.preco || '',
      quantidade_estoque: produto.quantidade_estoque || '',
      categoria: produto.categoria,
      data_validade: produto.data_validade || '',
      imagem_url: produto.imagem_url || '',
    });
    setEditandoId(produto.id);
    setErros({});
    setAlerta(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remover(produto) {
    const confirmado = window.confirm(`Excluir o produto "${produto.nome}"?`);

    if (!confirmado) return;

    try {
      const resposta = await apiProdutos.remover(produto.id);
      setAlerta({ tipo: 'sucesso', texto: resposta.mensagem });

      if (editandoId === produto.id) limparFormulario();

      await carregarLista();
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <h2>Cadastro de Produto</h2>
        <p className="cabecalho-pagina__descricao">
          Cadastre e gerencie os produtos disponíveis no estoque.
        </p>
      </header>

      <Alerta tipo={alerta?.tipo} aoFechar={() => setAlerta(null)}>
        {alerta?.texto}
      </Alerta>

      <form className="cartao" onSubmit={enviar} noValidate>
        <h3 className="cartao__titulo">
          {editandoId ? `Editando produto #${editandoId}` : 'Novo produto'}
        </h3>

        <div className="grade">
          <CampoTexto
            id="nome"
            rotulo="Nome do Produto"
            obrigatorio
            placeholder="Insira o nome do produto"
            value={formulario.nome}
            erro={erros.nome}
            onChange={(e) => alterarCampo('nome', e.target.value)}
          />

          <CampoTexto
            id="codigo_barras"
            rotulo="Código de Barras"
            placeholder="Insira o código de barras"
            value={formulario.codigo_barras}
            erro={erros.codigo_barras}
            onChange={(e) => alterarCampo('codigo_barras', e.target.value.replace(/\D/g, ''))}
          />

          <CampoTexto
            id="categoria"
            rotulo="Categoria"
            obrigatorio
            as="select"
            value={formulario.categoria}
            erro={erros.categoria}
            onChange={(e) => alterarCampo('categoria', e.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </CampoTexto>

          <CampoTexto
            id="quantidade_estoque"
            rotulo="Quantidade em Estoque"
            type="number"
            min="0"
            placeholder="Quantidade disponível"
            value={formulario.quantidade_estoque}
            erro={erros.quantidade_estoque}
            onChange={(e) => alterarCampo('quantidade_estoque', e.target.value)}
          />

          <CampoTexto
            id="preco"
            rotulo="Preço (R$)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={formulario.preco}
            erro={erros.preco}
            onChange={(e) => alterarCampo('preco', e.target.value)}
          />

          <CampoTexto
            id="data_validade"
            rotulo="Data de Validade"
            type="date"
            value={formulario.data_validade}
            erro={erros.data_validade}
            onChange={(e) => alterarCampo('data_validade', e.target.value)}
          />

          <CampoTexto
            id="descricao"
            rotulo="Descrição"
            obrigatorio
            as="textarea"
            rows={2}
            largo
            placeholder="Descreva brevemente o produto"
            value={formulario.descricao}
            erro={erros.descricao}
            onChange={(e) => alterarCampo('descricao', e.target.value)}
          />

          <CampoTexto
            id="imagem_url"
            rotulo="Imagem do Produto (URL)"
            largo
            placeholder="https://exemplo.com/foto-do-produto.jpg"
            value={formulario.imagem_url}
            erro={erros.imagem_url}
            onChange={(e) => alterarCampo('imagem_url', e.target.value)}
          />
        </div>

        <div className="acoes">
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
          </button>

          {editandoId && (
            <button type="button" className="botao botao--neutro" onClick={limparFormulario}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div className="cartao">
        <h3 className="cartao__titulo">Produtos cadastrados ({lista.length})</h3>

        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Código de Barras</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Validade</th>
                  <th className="tabela__acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((produto) => (
                  <tr key={produto.id}>
                    <td>
                      <strong>{produto.nome}</strong>
                      <div className="tabela__secundario">{produto.descricao}</div>
                    </td>
                    <td>{produto.codigo_barras || '-'}</td>
                    <td>{produto.categoria}</td>
                    <td>{formatarMoeda(produto.preco)}</td>
                    <td>{produto.quantidade_estoque}</td>
                    <td>{formatarData(produto.data_validade)}</td>
                    <td className="tabela__acoes">
                      <button
                        type="button"
                        className="botao botao--pequeno"
                        onClick={() => editar(produto)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="botao botao--pequeno botao--perigo"
                        onClick={() => remover(produto)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
