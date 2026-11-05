import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header({ usuarioLogado, onLogout, temaEscuro, onAlternarTema }) {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setMenuMobileAberto(false);
    setDropdownAberto(false);
  }, [location.pathname]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setDropdownAberto(false);
    onLogout();
    navigate('/');
  };

  const isRotaAtiva = (caminho) => location.pathname === caminho;

  return (
    <header className="cantina-header">
      <div className="logo">
        <Link to="/" className="link-logo">
          <img
            src="/img/logos/logo_cantina_sem_fundo.png"
            alt="Logo da Cantina Serra e Soares"
            className="imagem-logo"
          />
          <h1>Cantina Serra e Soares</h1>
        </Link>
      </div>

      <input
        type="checkbox"
        id="menu-toggle"
        checked={menuMobileAberto}
        onChange={(e) => setMenuMobileAberto(e.target.checked)}
      />
      <label htmlFor="menu-toggle" className="menu-burguer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </label>

      <nav className="cantina-nav">
        <ul>
          <li className="item-tema">
            <button
              id="btn-tema"
              className="btn-tema"
              title="Mudar Tema"
              onClick={onAlternarTema}
              type="button"
            >
              <svg
                className="icone-lua"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <svg
                className="icone-sol"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
          </li>

          <li className={isRotaAtiva('/') ? 'ativo' : ''}>
            <Link to="/">Início</Link>
          </li>
          <li className={isRotaAtiva('/cardapio') ? 'ativo' : ''}>
            <Link to="/cardapio">Cardápio</Link>
          </li>

          {usuarioLogado && (
            <>
              <li className={`item-restrito ${isRotaAtiva('/pedidos') ? 'ativo' : ''}`}>
                <Link to="/pedidos">Meus Pedidos</Link>
              </li>
              <li className={`item-restrito ${isRotaAtiva('/contato') ? 'ativo' : ''}`}>
                <Link to="/contato">Contato</Link>
              </li>
            </>
          )}

          <li className={isRotaAtiva('/sobre') ? 'ativo' : ''}>
            <Link to="/sobre">Sobre</Link>
          </li>

          {!usuarioLogado ? (
            <li id="nav-login">
              <Link to="/login" className="btn-nav-login">
                Entrar
              </Link>
            </li>
          ) : (
            <li id="nav-usuario" className="menu-usuario-container" ref={dropdownRef}>
              <button
                id="btn-perfil"
                type="button"
                className={`btn-nav-perfil ${dropdownAberto ? 'aberto' : ''}`}
                onClick={() => setDropdownAberto((prev) => !prev)}
              >
                <span id="nome-usuario-header">{usuarioLogado}</span>
                <span className="setinha">▼</span>
              </button>

              <div
                id="dropdown-logout"
                className={`dropdown-oculto ${dropdownAberto ? 'mostrar' : ''}`}
              >
                <Link
                  to="/configuracoes"
                  className="btn-dropdown-config"
                  onClick={() => setDropdownAberto(false)}
                >
                  Configurações
                </Link>
                <button type="button" onClick={handleLogoutClick} className="btn-sair">
                  Sair da Conta
                </button>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
