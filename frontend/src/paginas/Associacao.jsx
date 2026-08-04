import { useEffect, useState } from 'react';

import Alerta from '../componentes/Alerta.jsx';
import {
  associacoes as apiAssociacoes,
  fornecedores as apiFornecedores,
  produtos as apiProdutos,
} from '../servicos/api.js';
import { mascaraCnpj } from '../utils/formatadores.js';

export default function Associacao() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [associados, setAssociados] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [carregandoAssociados, setCarregandoAssociados] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const produtoSelecionado = produtos.find((p) => String(p.id) === String(produtoId));

  useEffect(() => {
    Promise.all([apiProdutos.listar(), apiFornecedores.listar()])
      .then(([respostaProdutos, respostaFornecedores]) => {
        setProdutos(respostaProdutos.dados);
        setFornecedores(respostaFornecedores.dados);
      })
      .catch((erro) => setAlerta({ tipo: 'erro', texto: erro.message }));
  }, []);

  async function carregarAssociados(id) {
    if (!id) {
      setAssociados([]);
      return;
    }

    setCarregandoAssociados(true);

    try {
      const resposta = await apiProdutos.fornecedores(id);
      setAssociados(resposta.dados);
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
      setAssociados([]);
    } finally {
      setCarregandoAssociados(false);
    }
  }

  // Toda vez que o produto muda, recarrega os fornecedores dele
  useEffect(() => {
    carregarAssociados(produtoId);
    setFornecedorId('');
    setAlerta(null);
  }, [produtoId]);

  async function associar() {
    setAlerta(null);

    if (!fornecedorId) {
      setAlerta({ tipo: 'erro', texto: 'Selecione um fornecedor para associar.' });
      return;
    }

    setEnviando(true);

    try {
      const resposta = await apiAssociacoes.associar(Number(produtoId), Number(fornecedorId));
      setAlerta({ tipo: 'sucesso', texto: resposta.mensagem });
      setFornecedorId('');
      await carregarAssociados(produtoId);
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  async function desassociar(fornecedor) {
    setAlerta(null);

    try {
      const resposta = await apiAssociacoes.desassociar(Number(produtoId), fornecedor.id);
      setAlerta({ tipo: 'sucesso', texto: resposta.mensagem });
      await carregarAssociados(produtoId);
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
    }
  }

  const idsAssociados = associados.map((f) => f.id);

  return (
    <section>
      <header className="cabecalho-pagina">
        <h2>Associação de Fornecedor a Produto</h2>
        <p className="cabecalho-pagina__descricao">
          Um produto pode ter vários fornecedores e um fornecedor pode oferecer vários produtos.
        </p>
      </header>

      <Alerta tipo={alerta?.tipo} aoFechar={() => setAlerta(null)}>
        {alerta?.texto}
      </Alerta>

      <div className="cartao">
        <h3 className="cartao__titulo">Produto</h3>

        <div className="campo">
          <label className="campo__rotulo" htmlFor="produto">
            Selecione o produto
          </label>
          <select
            id="produto"
            className="campo__controle"
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
          >
            <option value="">Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome}
                {produto.codigo_barras ? ` — ${produto.codigo_barras}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {produtoSelecionado && (
        <>
          <div className="cartao">
            <h3 className="cartao__titulo">Detalhes do Produto</h3>

            <div className="detalhes">
              {produtoSelecionado.imagem_url && (
                <img
                  className="detalhes__miniatura"
                  src={produtoSelecionado.imagem_url}
                  alt={produtoSelecionado.nome}
                />
              )}

              <dl className="detalhes__lista">
                <div>
                  <dt>Nome do Produto</dt>
                  <dd>{produtoSelecionado.nome}</dd>
                </div>
                <div>
                  <dt>Código de Barras</dt>
                  <dd>{produtoSelecionado.codigo_barras || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>{produtoSelecionado.categoria}</dd>
                </div>
                <div className="detalhes__largo">
                  <dt>Descrição</dt>
                  <dd>{produtoSelecionado.descricao}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="cartao">
            <h3 className="cartao__titulo">Associação de Fornecedor</h3>

            <div className="linha-associacao">
              <div className="campo">
                <label className="campo__rotulo" htmlFor="fornecedor">
                  Seleção de Fornecedor
                </label>
                <select
                  id="fornecedor"
                  className="campo__controle"
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome_empresa}
                      {idsAssociados.includes(fornecedor.id) ? ' (já associado)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="botao botao--primario"
                onClick={associar}
                disabled={enviando}
              >
                {enviando ? 'Associando...' : 'Associar Fornecedor'}
              </button>
            </div>
          </div>

          <div className="cartao">
            <h3 className="cartao__titulo">Fornecedores Associados ({associados.length})</h3>

            {carregandoAssociados ? (
              <p className="vazio">Carregando...</p>
            ) : associados.length === 0 ? (
              <p className="vazio">Este produto ainda não possui fornecedores associados.</p>
            ) : (
              <div className="tabela-rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Nome do Fornecedor</th>
                      <th>CNPJ</th>
                      <th className="tabela__acoes">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {associados.map((fornecedor) => (
                      <tr key={fornecedor.id}>
                        <td>{fornecedor.nome_empresa}</td>
                        <td>{mascaraCnpj(fornecedor.cnpj)}</td>
                        <td className="tabela__acoes">
                          <button
                            type="button"
                            className="botao botao--pequeno botao--perigo"
                            onClick={() => desassociar(fornecedor)}
                          >
                            Desassociar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
