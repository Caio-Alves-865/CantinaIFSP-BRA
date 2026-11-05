import { useState, useEffect, useRef } from 'react';
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

  const layoutRef = useRef(null);
  const widgetPromoRef = useRef(null);

  // Movimento suave com inércia (leve atraso) para o card de Promoções acompanhar a rolagem no meio da tela
  useEffect(() => {
    let atualY = 0;
    let alvoY = 0;
    let rafId = null;

    const calcularAlvo = () => {
      const layoutEl = layoutRef.current;
      const widgetEl = widgetPromoRef.current;
      if (!layoutEl || !widgetEl) return;

      if (
        window.innerWidth <= 992 ||
        document.documentElement.classList.contains('reduzir-movimento')
      ) {
        alvoY = 0;
        atualY = 0;
        widgetEl.style.transform = '';
        return;
      }

      const rectLayout = layoutEl.getBoundingClientRect();
      const alturaLayout = layoutEl.offsetHeight;
      const alturaWidget = widgetEl.offsetHeight;
      const maxDeslocamento = Math.max(0, alturaLayout - alturaWidget);

      // Posição ideal: centralizado verticalmente na área útil da tela (abaixo do header)
      const topoIdealNaTela = Math.max(105, (window.innerHeight - alturaWidget) / 2 + 25);
      const deslocamentoDesejado = topoIdealNaTela - rectLayout.top;

      alvoY = Math.min(maxDeslocamento, Math.max(0, deslocamentoDesejado));
    };

    const animarSuave = () => {
      const widgetEl = widgetPromoRef.current;
      if (!widgetEl) return;

      // Interpolação suave (lerp) que cria o efeito de flutuação com leve atraso
      atualY += (alvoY - atualY) * 0.075;

      if (Math.abs(alvoY - atualY) > 0.15) {
        widgetEl.style.transform = `translate3d(0, ${atualY.toFixed(2)}px, 0)`;
        rafId = requestAnimationFrame(animarSuave);
      } else {
        atualY = alvoY;
        widgetEl.style.transform = `translate3d(0, ${alvoY.toFixed(2)}px, 0)`;
        rafId = null;
      }
    };

    const aoRolarOuRedimensionar = () => {
      calcularAlvo();
      if (!rafId && window.innerWidth > 992) {
        rafId = requestAnimationFrame(animarSuave);
      }
    };

    calcularAlvo();
    window.addEventListener('scroll', aoRolarOuRedimensionar, { passive: true });
    window.addEventListener('resize', aoRolarOuRedimensionar, { passive: true });

    return () => {
      window.removeEventListener('scroll', aoRolarOuRedimensionar);
      window.removeEventListener('resize', aoRolarOuRedimensionar);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Rotação automática do carrossel de banners a cada 4 segundos (pausada se "Reduzir Animações" estiver ativo)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.documentElement.classList.contains('reduzir-movimento')) return;
      setSlideIndex((prev) => (prev + 1) % bannersData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Rotação automática do carrossel de promoções a cada 5 segundos (pausada se "Reduzir Animações" estiver ativo)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.documentElement.classList.contains('reduzir-movimento')) return;
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
      <div className="layout-duas-colunas" ref={layoutRef}>
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

            <div className="indicadores-galeria-modal indicadores-banner">
              {bannersData.map((banner, idx) => (
                <button
                  key={banner.id}
                  type="button"
                  className={`ponto-galeria ${idx === slideIndex ? 'ativo' : ''}`}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Ir para o banner ${idx + 1}`}
                />
              ))}
            </div>
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
          <div className="widget-ofertas" ref={widgetPromoRef}>
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
