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
import Configuracoes from './pages/Configuracoes';
import PaginaNaoEncontrada from './pages/PaginaNaoEncontrada';
import {
  obterPerfilUsuarioAtual,
  salvarPerfilUsuarioAtual,
  aplicarAcessibilidadeNoDOM,
} from './utils/usuarioStorage';
import './styles/configuracoes.css';

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

  // Ao mudar de rota / tela, rola suave e rapidamente de volta para o topo da página
  useEffect(() => {
    const reduzirMovimento = document.documentElement.classList.contains('reduzir-movimento');
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduzirMovimento ? 'instant' : 'smooth',
    });
    if (document.documentElement) {
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: reduzirMovimento ? 'instant' : 'smooth',
      });
    }
  }, [location.pathname]);

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

  // Sincroniza as classes de sessão e preferências de acessibilidade no <html>
  useEffect(() => {
    const root = document.documentElement;
    if (usuarioLogado) {
      root.classList.add('usuario-logado');
      root.classList.remove('usuario-deslogado');
      const perfil = obterPerfilUsuarioAtual(usuarioLogado);
      aplicarAcessibilidadeNoDOM(perfil);
    } else {
      root.classList.add('usuario-deslogado');
      root.classList.remove('usuario-logado');
      // Ao sair da conta, volta para a aparência padrão (fonte, movimento e contraste)
      aplicarAcessibilidadeNoDOM({
        tamanhoFonte: 'normal',
        reduzirMovimento: false,
        altoContraste: false,
        grauContraste: 0.5,
        modoDaltonismo: 'nenhum',
        grauDaltonismo: 0.5,
      });
    }
  }, [usuarioLogado]);

  const alternarTema = () => {
    const novoValor = !temaEscuro;
    setTemaEscuro(novoValor);
    // Mantém o tema preferido do perfil sincronizado quando alterado pelo botão do Header
    if (usuarioLogado) {
      salvarPerfilUsuarioAtual({ temaPreferido: novoValor ? 'escuro' : 'claro' });
    }
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
      {/* Filtros de correção de cor (daltonização) usados pelo modo de daltonismo das Configurações */}
      <svg className="filtros-daltonismo-svg" aria-hidden="true" focusable="false">
        <defs>
          <filter id="filtro-protanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.7833 0.2167 0 0 0  0.2792 0.7208 0 0 0  0 0.1208 0.8792 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="filtro-deuteranopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.8125 0.1875 0 0 0  0.3500 0.6500 0 0 0  0 0.1500 0.8500 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="filtro-tritanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.9750 0.0250 0 0 0  0 0.7167 0.2833 0 0  0 0.2375 0.7625 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
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
          element={
            <Pedidos
              usuarioLogado={usuarioLogado}
              onAbrirModal={setProdutoModal}
            />
          }
        />
        <Route
          path="/contato"
          element={<Contato usuarioLogado={usuarioLogado} />}
        />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/ajuda" element={<Ajuda usuarioLogado={usuarioLogado} />} />
        <Route
          path="/configuracoes"
          element={
            <Configuracoes
              usuarioLogado={usuarioLogado}
              onAtualizarNomeUsuario={handleLoginSucesso}
              temaEscuro={temaEscuro}
              onDefinirTemaEscuro={setTemaEscuro}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              onLoginSucesso={handleLoginSucesso}
              onAlternarTema={alternarTema}
            />
          }
        />
        <Route path="*" element={<PaginaNaoEncontrada />} />
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
