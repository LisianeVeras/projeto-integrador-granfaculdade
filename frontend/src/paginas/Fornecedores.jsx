import { useEffect, useState } from 'react';

import Alerta from '../componentes/Alerta.jsx';
import CampoTexto from '../componentes/CampoTexto.jsx';
import { ErroApi, fornecedores as apiFornecedores } from '../servicos/api.js';
import { mascaraCnpj, mascaraTelefone } from '../utils/formatadores.js';
import { validarFornecedorLocal } from '../utils/validacaoLocal.js';

const FORMULARIO_VAZIO = {
  nome_empresa: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contato_principal: '',
};

export default function Fornecedores() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function carregarLista() {
    try {
      const resposta = await apiFornecedores.listar();
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
    const errosLocais = validarFornecedorLocal(formulario);

    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      setAlerta({ tipo: 'erro', texto: 'Preencha os campos obrigatórios destacados.' });
      return;
    }

    setEnviando(true);

    try {
      const resposta = editandoId
        ? await apiFornecedores.atualizar(editandoId, formulario)
        : await apiFornecedores.criar(formulario);

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

  function editar(fornecedor) {
    setFormulario({
      nome_empresa: fornecedor.nome_empresa,
      cnpj: mascaraCnpj(fornecedor.cnpj),
      endereco: fornecedor.endereco,
      telefone: mascaraTelefone(fornecedor.telefone),
      email: fornecedor.email,
      contato_principal: fornecedor.contato_principal,
    });
    setEditandoId(fornecedor.id);
    setErros({});
    setAlerta(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remover(fornecedor) {
    const confirmado = window.confirm(`Excluir o fornecedor "${fornecedor.nome_empresa}"?`);

    if (!confirmado) return;

    try {
      const resposta = await apiFornecedores.remover(fornecedor.id);
      setAlerta({ tipo: 'sucesso', texto: resposta.mensagem });

      if (editandoId === fornecedor.id) limparFormulario();

      await carregarLista();
    } catch (erro) {
      setAlerta({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <section>
      <header className="cabecalho-pagina">
        <h2>Cadastro de Fornecedor</h2>
        <p className="cabecalho-pagina__descricao">
          Cadastre e gerencie os fornecedores com os quais a empresa faz negócios.
        </p>
      </header>

      <Alerta tipo={alerta?.tipo} aoFechar={() => setAlerta(null)}>
        {alerta?.texto}
      </Alerta>

      <form className="cartao" onSubmit={enviar} noValidate>
        <h3 className="cartao__titulo">
          {editandoId ? `Editando fornecedor #${editandoId}` : 'Novo fornecedor'}
        </h3>

        <div className="grade">
          <CampoTexto
            id="nome_empresa"
            rotulo="Nome da Empresa"
            obrigatorio
            placeholder="Insira o nome da empresa"
            value={formulario.nome_empresa}
            erro={erros.nome_empresa}
            onChange={(e) => alterarCampo('nome_empresa', e.target.value)}
          />

          <CampoTexto
            id="cnpj"
            rotulo="CNPJ"
            obrigatorio
            placeholder="00.000.000/0000-00"
            value={formulario.cnpj}
            erro={erros.cnpj}
            onChange={(e) => alterarCampo('cnpj', mascaraCnpj(e.target.value))}
          />

          <CampoTexto
            id="telefone"
            rotulo="Telefone"
            obrigatorio
            placeholder="(00) 0000-0000"
            value={formulario.telefone}
            erro={erros.telefone}
            onChange={(e) => alterarCampo('telefone', mascaraTelefone(e.target.value))}
          />

          <CampoTexto
            id="email"
            rotulo="E-mail"
            obrigatorio
            type="email"
            placeholder="exemplo@fornecedor.com"
            value={formulario.email}
            erro={erros.email}
            onChange={(e) => alterarCampo('email', e.target.value)}
          />

          <CampoTexto
            id="contato_principal"
            rotulo="Contato Principal"
            obrigatorio
            placeholder="Nome do contato principal"
            value={formulario.contato_principal}
            erro={erros.contato_principal}
            onChange={(e) => alterarCampo('contato_principal', e.target.value)}
          />

          <CampoTexto
            id="endereco"
            rotulo="Endereço"
            obrigatorio
            as="textarea"
            rows={2}
            largo
            placeholder="Insira o endereço completo da empresa"
            value={formulario.endereco}
            erro={erros.endereco}
            onChange={(e) => alterarCampo('endereco', e.target.value)}
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
        <h3 className="cartao__titulo">Fornecedores cadastrados ({lista.length})</h3>

        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="vazio">Nenhum fornecedor cadastrado ainda.</p>
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Contato</th>
                  <th className="tabela__acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>{fornecedor.nome_empresa}</td>
                    <td>{mascaraCnpj(fornecedor.cnpj)}</td>
                    <td>{mascaraTelefone(fornecedor.telefone)}</td>
                    <td>{fornecedor.email}</td>
                    <td>{fornecedor.contato_principal}</td>
                    <td className="tabela__acoes">
                      <button
                        type="button"
                        className="botao botao--pequeno"
                        onClick={() => editar(fornecedor)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="botao botao--pequeno botao--perigo"
                        onClick={() => remover(fornecedor)}
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
