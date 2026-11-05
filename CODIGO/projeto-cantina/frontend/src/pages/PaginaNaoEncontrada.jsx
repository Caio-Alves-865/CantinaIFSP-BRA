import { Link } from 'react-router-dom';
import '../styles/paginaNaoEncontrada.css';

function PaginaNaoEncontrada() {
  return (
    <main className="pagina-nao-encontrada-main">
      {/* Decoração Botânica com Folhas inspiradas na tela de Login */}
      <div className="fundo-folhas-404" aria-hidden="true">
        <svg className="folha-decorativa-404 folha-404-1" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
          <circle cx="35" cy="30" r="3" fill="currentColor" />
          <circle cx="95" cy="80" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa-404 folha-404-2" viewBox="0 0 120 120" fill="none">
          <path
            d="M15 95 C25 40, 65 20, 105 25 C90 65, 65 95, 15 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M15 95 Q55 62 96 30" stroke="currentColor" strokeWidth="2" />
          <circle cx="28" cy="45" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa-404 folha-404-3" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
          <circle cx="85" cy="90" r="3.5" fill="currentColor" />
          <circle cx="45" cy="22" r="2" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa-404 folha-404-4" viewBox="0 0 120 120" fill="none">
          <path
            d="M25 95 C25 45, 65 22, 100 20 C95 58, 70 92, 25 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M25 95 Q60 60 92 26" stroke="currentColor" strokeWidth="2" />
          <circle cx="88" cy="75" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa-404 folha-404-5" viewBox="0 0 120 120" fill="none">
          <path
            d="M18 98 C22 48, 62 24, 102 18 C96 58, 72 92, 18 98 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M18 98 Q58 60 94 24" stroke="currentColor" strokeWidth="2" />
          <circle cx="65" cy="95" r="3" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa-404 folha-404-6" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="card-404">
        <span className="badge-codigo-404">Erro 404</span>

        <div className="icone-ilustracao-404" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <h1 className="titulo-404">Ops! Não encontramos essa página</h1>

        <p className="mensagem-educada-404">
          O endereço que você tentou acessar não existe, foi alterado ou não está mais disponível.
          Fique tranquilo, o cardápio da Cantina Serra e Soares continua repleto de opções deliciosas
          esperando por você!
        </p>

        <div className="acoes-404">
          <Link to="/" className="btn-404-principal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Voltar ao Início
          </Link>

          <Link to="/cardapio" className="btn-404-secundario">
            Ver Cardápio
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PaginaNaoEncontrada;
