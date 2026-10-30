import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import {
  bannersData,
  categoriasData,
  destaquesData,
  promocoesData,
} from '../data/produtosData';

function Home({
  usuarioLogado = null,
  quantidades = {},
  onAlterarQuantidade,
  onAbrirModal,
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('todos');

  // Rotação automática do carrossel de banners a cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % bannersData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Rotação automática do carrossel de promoções a cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promocoesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const moverSlide = (direcao) => {
    setSlideIndex((prev) => (prev + direcao + bannersData.length) % bannersData.length);
  };

  const moverPromo = (direcao) => {
    setPromoIndex(
      (prev) => (prev + direcao + promocoesData.length) % promocoesData.length
    );
  };

  // Filtra os produtos da prateleira conforme pesquisa e categoria ativa
  const produtosFiltrados = destaquesData.filter((produto) => {
    const correspondePesquisa = produto.nome
      .toLowerCase()
      .includes(termoPesquisa.toLowerCase());
    const correspondeCategoria =
      filtroAtivo === 'todos' || produto.categoria === filtroAtivo;
    return correspondePesquisa && correspondeCategoria;
  });

  return (
    <main className="conteudo-principal">
      <div className="layout-duas-colunas">
        <div className="coluna-principal">
          {/* Carrossel de Banners */}
          <div className="carrossel-container">
            {bannersData.map((banner, index) => (
              <div
                key={banner.id}
                className={`slide ${index === slideIndex ? 'ativo' : ''}`}
              >
                <img src={banner.imagem} alt={banner.alt} />
              </div>
            ))}
            <button
              type="button"
              className="seta-carrossel anterior"
              onClick={() => moverSlide(-1)}
              aria-label="Slide anterior"
            >
              &#10094;
            </button>
            <button
              type="button"
              className="seta-carrossel proxima"
              onClick={() => moverSlide(1)}
              aria-label="Próximo slide"
            >
              &#10095;
            </button>
          </div>

          {/* Pesquisa e Filtros de Categoria */}
          <section className="pesquisa-filtros">
            <div className="barra-pesquisa">
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
                id="input-pesquisa"
                placeholder="O que você quer comer hoje?"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
              />
            </div>

            <div className="filtros-categoria">
              {categoriasData.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`btn-filtro ${filtroAtivo === cat.id ? 'ativo' : ''}`}
                  data-filtro={cat.id}
                  onClick={() => setFiltroAtivo(cat.id)}
                >
                  {cat.nome}
                </button>
              ))}
            </div>
          </section>

          <div className="secao-titulo-destaques">
            <h2>Destaques do Dia</h2>
          </div>

          {/* Prateleira de Produtos com Rolagem Horizontal */}
          <section className="prateleira">
            <div className="cabecalho-prateleira">
              <h3 className="titulo-com-icone">
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
                  className="icone-secao"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
                <span>Lanches Mais Pedidos</span>
              </h3>
              <Link to="/cardapio" className="ver-todos">
                Ver cardápio completo &rarr;
              </Link>
            </div>

            {produtosFiltrados.length > 0 ? (
              <div className="container-cards">
                {produtosFiltrados.map((produto) => (
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
            ) : (
              <div className="estado-vazio-busca">
                <p>Nenhum item encontrado para essa busca ou categoria.</p>
              </div>
            )}
          </section>
        </div>

        {/* Coluna Lateral: Promoções em Destaque */}
        <aside className="coluna-lateral">
          <div className="widget-ofertas">
            <h3 className="titulo-com-icone titulo-ofertas">
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
                className="icone-secao Destaque"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Promoções em Destaque</span>
            </h3>

            <div className="carrossel-promocoes">
              {promocoesData.map((promo, index) => (
                <ProductCard
                  key={promo.id}
                  produto={promo}
                  classNameExtra={`promo-slide ${index === promoIndex ? 'ativo' : ''}`}
                  usuarioLogado={usuarioLogado}
                  quantidade={quantidades[promo.id] || 0}
                  onAlterarQuantidade={onAlterarQuantidade}
                  onAbrirModal={onAbrirModal}
                />
              ))}

              <div className="controles-promo">
                <button
                  type="button"
                  className="seta-promo"
                  onClick={() => moverPromo(-1)}
                  aria-label="Promoção anterior"
                >
                  &#10094;
                </button>
                <div className="indicadores-promo">
                  {promocoesData.map((promo, idx) => (
                    <span
                      key={promo.id}
                      className={`ponto-promo ${idx === promoIndex ? 'ativo' : ''}`}
                      onClick={() => setPromoIndex(idx)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="seta-promo"
                  onClick={() => moverPromo(1)}
                  aria-label="Próxima promoção"
                >
                  &#10095;
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Home;
