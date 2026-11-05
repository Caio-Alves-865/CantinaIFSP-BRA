import { useState, useRef, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { categoriasData, cardapioCompletoData } from '../data/produtosData';
import '../styles/cardapio.css';

function renderizarIconeCategoria(idCategoria) {
  switch (idCategoria) {
    case 'salgado':
      return (
        <svg
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
          {/* Formato de Coxinha (ponta para cima e base arredondada no pratinho) */}
          <path d="M12 3C9.8 3 6 10.2 6 14.8A6 5.2 0 0 0 18 14.8C18 10.2 14.2 3 12 3Z" />
          <path d="M9.5 13.5c.3 1.5 1.5 2.7 3 3" />
          <path d="M4 21h16" />
        </svg>
      );
    case 'doce':
      return (
        <svg
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
          {/* Ícone de Bala Doce (Candy) */}
          <path d="m9.5 7.5-2 2a4.95 4.95 0 1 0 7 7l2-2a4.95 4.95 0 1 0-7-7Z" />
          <path d="M14 6.5v10" />
          <path d="M10 7.5v10" />
          <path d="m16 7 1-5 1.37.68A3 3 0 0 0 19.7 3H21v1.3c0 .46.1.92.32 1.33L22 7l-5 1" />
          <path d="m8 17-1 5-1.37-.68A3 3 0 0 0 4.3 21H3v-1.3a3 3 0 0 0-.32-1.33L2 17l5-1" />
        </svg>
      );
    case 'bebida':
      return (
        <svg
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
          {/* Ícone de Garrafa com rótulo */}
          <path d="M10 2h4" />
          <path d="M10 2v3.5L7.6 9.1A4 4 0 0 0 7 11.2V19a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-7.8a4 4 0 0 0-.6-2.1L14 5.5V2" />
          <path d="M7 13h10" />
          <path d="M7 17h10" />
        </svg>
      );
    case 'prato':
    default:
      return (
        <svg
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
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      );
  }
}

function Cardapio({
  usuarioLogado = null,
  quantidades = {},
  onAlterarQuantidade,
  onAbrirModal,
}) {
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(false);
  const filtroRef = useRef(null);

  const termoLimpo = termoPesquisa.toLowerCase().trim();

  // Fecha o dropdown de filtro ao clicar fora
  useEffect(() => {
    function handleClickFora(e) {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setMenuFiltroAberto(false);
      }
    }
    document.addEventListener('click', handleClickFora);
    return () => document.removeEventListener('click', handleClickFora);
  }, []);

  // Opções exibidas no seletor de filtro da barra de pesquisa (inclui "Promoções" sem emoji)
  const opcoesFiltroBarra = [
    categoriasData[0], // Todos
    { id: 'promocao', nome: 'Promoções' },
    ...categoriasData.slice(1),
  ];

  // Categorias reais (excluindo 'todos') filtradas caso uma categoria específica esteja selecionada
  const secoesCategorias = categoriasData.filter(
    (cat) =>
      cat.id !== 'todos' &&
      (categoriaAtiva === 'todos' ||
        categoriaAtiva === 'promocao' ||
        cat.id === categoriaAtiva)
  );

  const categoriaSelecionadaObj =
    opcoesFiltroBarra.find((c) => c.id === categoriaAtiva) || opcoesFiltroBarra[0];

  const temAlgumResultado = secoesCategorias.some((secao) =>
    cardapioCompletoData.some(
      (prod) =>
        prod.categoria === secao.id &&
        (categoriaAtiva !== 'promocao' || prod.emPromocao) &&
        (termoLimpo === '' || prod.nome.toLowerCase().includes(termoLimpo))
    )
  );

  return (
    <main className="conteudo-principal cardapio-main">
      <section className="pesquisa-filtros">
        <div className="barra-pesquisa barra-pesquisa-com-filtro">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icone-lupa"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            id="pesquisa-cardapio"
            placeholder="Buscar no cardápio completo..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
          />

          {/* Botão seletor de categorias integrado na direita da barra de pesquisa */}
          <div className="seletor-categoria-barra" ref={filtroRef}>
            <button
              type="button"
              className={`btn-seletor-barra ${menuFiltroAberto ? 'aberto' : ''} ${
                categoriaAtiva !== 'todos' ? 'filtrado' : ''
              }`}
              onClick={() => setMenuFiltroAberto((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>{categoriaSelecionadaObj.nome}</span>
              <span className="seta-seletor-barra">▼</span>
            </button>

            {menuFiltroAberto && (
              <ul className="dropdown-categorias-barra">
                {opcoesFiltroBarra.map((cat) => (
                  <li
                    key={cat.id}
                    className={`item-dropdown-barra ${
                      categoriaAtiva === cat.id ? 'ativo' : ''
                    }`}
                    onClick={() => {
                      setCategoriaAtiva(cat.id);
                      setMenuFiltroAberto(false);
                    }}
                  >
                    {cat.nome}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div id="container-categorias">
        {!temAlgumResultado ? (
          <div className="estado-vazio-busca">
            <p>Nenhum produto encontrado para essa pesquisa.</p>
          </div>
        ) : (
          secoesCategorias.map((secao) => {
            const produtosDaCategoria = cardapioCompletoData.filter((prod) => {
              const pertenceCategoria = prod.categoria === secao.id;
              const bateFiltroPromo =
                categoriaAtiva !== 'promocao' || Boolean(prod.emPromocao);
              const batePesquisa =
                termoLimpo === '' || prod.nome.toLowerCase().includes(termoLimpo);
              return pertenceCategoria && bateFiltroPromo && batePesquisa;
            });

            if (produtosDaCategoria.length === 0) {
              return null;
            }

            return (
              <section key={secao.id} className="secao-categoria">
                <div className="cabecalho-secao-cardapio">
                  <div className="icone-categoria-cardapio" aria-hidden="true">
                    {renderizarIconeCategoria(secao.id)}
                  </div>
                  <h2 className="titulo-categoria">{secao.tituloSecao}</h2>
                </div>

                <div className="grade-produtos">
                  {produtosDaCategoria.map((produto) => (
                    <ProductCard
                      key={produto.id}
                      produto={produto}
                      usuarioLogado={usuarioLogado}
                      quantidade={quantidades[produto.id] || 0}
                      onAlterarQuantidade={onAlterarQuantidade}
                      onAbrirModal={onAbrirModal}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

export default Cardapio;
