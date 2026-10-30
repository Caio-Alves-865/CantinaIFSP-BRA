import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import Home from './pages/Home';
import Cardapio from './pages/Cardapio';
import Pedidos from './pages/Pedidos';
import Contato from './pages/Contato';
import Sobre from './pages/Sobre';
import Ajuda from './pages/Ajuda';
import Login from './pages/Login';

function App() {
  const [temaEscuro, setTemaEscuro] = useState(
    () => localStorage.getItem('tema_cantina') === 'escuro'
  );
  const [usuarioLogado, setUsuarioLogado] = useState(
    () => localStorage.getItem('usuario_cantina') || null
  );

  // Estado visual de quantidades por ID do produto (ex: { 1: 2, 3: 1 })
  const [quantidadesProdutos, setQuantidadesProdutos] = useState({});
  // Produto atualmente aberto no modal de detalhes
  const [produtoModal, setProdutoModal] = useState(null);

  const location = useLocation();
  const isPaginaLogin = location.pathname === '/login';

  // Sincroniza a classe 'tema-escuro' no <html> e salva no localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (temaEscuro) {
      root.classList.add('tema-escuro');
      localStorage.setItem('tema_cantina', 'escuro');
    } else {
      root.classList.remove('tema-escuro');
      localStorage.setItem('tema_cantina', 'claro');
    }
  }, [temaEscuro]);

  // Sincroniza as classes de sessão no <html>
  useEffect(() => {
    const root = document.documentElement;
    if (usuarioLogado) {
      root.classList.add('usuario-logado');
      root.classList.remove('usuario-deslogado');
    } else {
      root.classList.add('usuario-deslogado');
      root.classList.remove('usuario-logado');
    }
  }, [usuarioLogado]);

  const alternarTema = () => {
    setTemaEscuro((prev) => !prev);
  };

  const handleLoginSucesso = (nomeUsuario) => {
    localStorage.setItem('usuario_cantina', nomeUsuario);
    setUsuarioLogado(nomeUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario_cantina');
    setUsuarioLogado(null);
    setQuantidadesProdutos({});
  };

  // Incrementa ou decrementa a quantidade visual de qualquer produto
  const handleAlterarQuantidade = (produtoId, delta) => {
    setQuantidadesProdutos((prev) => {
      const atual = prev[produtoId] || 0;
      const novaQtd = Math.max(0, atual + delta);
      return {
        ...prev,
        [produtoId]: novaQtd,
      };
    });
  };

  return (
    <>
      {!isPaginaLogin && (
        <Header
          usuarioLogado={usuarioLogado}
          onLogout={handleLogout}
          temaEscuro={temaEscuro}
          onAlternarTema={alternarTema}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              usuarioLogado={usuarioLogado}
              quantidades={quantidadesProdutos}
              onAlterarQuantidade={handleAlterarQuantidade}
              onAbrirModal={setProdutoModal}
            />
          }
        />
        <Route
          path="/cardapio"
          element={
            <Cardapio
              usuarioLogado={usuarioLogado}
              quantidades={quantidadesProdutos}
              onAlterarQuantidade={handleAlterarQuantidade}
              onAbrirModal={setProdutoModal}
            />
          }
        />
        <Route
          path="/pedidos"
          element={<Pedidos usuarioLogado={usuarioLogado} />}
        />
        <Route
          path="/contato"
          element={<Contato usuarioLogado={usuarioLogado} />}
        />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route
          path="/login"
          element={
            <Login
              onLoginSucesso={handleLoginSucesso}
              onAlternarTema={alternarTema}
            />
          }
        />
      </Routes>

      {!isPaginaLogin && (
        <ProductModal
          produto={produtoModal}
          onFechar={() => setProdutoModal(null)}
          quantidade={produtoModal ? quantidadesProdutos[produtoModal.id] || 0 : 0}
          onAlterarQuantidade={handleAlterarQuantidade}
          usuarioLogado={usuarioLogado}
        />
      )}

      {!isPaginaLogin && <Footer />}
    </>
  );
}

export default App;
