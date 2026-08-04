import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';

import Associacao from './paginas/Associacao.jsx';
import Fornecedores from './paginas/Fornecedores.jsx';
import Produtos from './paginas/Produtos.jsx';

const LINKS = [
  { para: '/fornecedores', texto: 'Fornecedores' },
  { para: '/produtos', texto: 'Produtos' },
  { para: '/associacao', texto: 'Associação' },
];

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <header className="topo">
        <div className="topo__conteudo">
          <div className="topo__marca">
            <span className="topo__logo">▦</span>
            <div>
              <strong>Gestão de Estoque</strong>
              <small>Projeto Integrador</small>
            </div>
          </div>

          <nav className="menu">
            {LINKS.map((link) => (
              <NavLink
                key={link.para}
                to={link.para}
                className={({ isActive }) => `menu__item ${isActive ? 'ativo' : ''}`}
              >
                {link.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Navigate to="/fornecedores" replace />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/associacao" element={<Associacao />} />
          <Route path="*" element={<Navigate to="/fornecedores" replace />} />
        </Routes>
      </main>

      <footer className="rodape">
        Projeto Integrador · Sistema de Gestão de Estoque
      </footer>
    </BrowserRouter>
  );
}
