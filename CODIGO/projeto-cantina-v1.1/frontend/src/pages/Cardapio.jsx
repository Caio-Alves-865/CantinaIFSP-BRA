import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { categoriasData, cardapioCompletoData } from '../data/produtosData';
import '../styles/cardapio.css';

function Cardapio({
  usuarioLogado = null,
  quantidades = {},
  onAlterarQuantidade,
  onAbrirModal,
}) {
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const termoLimpo = termoPesquisa.toLowerCase().trim();

  // Categorias reais (excluindo 'todos')
  const secoesCategorias = categoriasData.filter((cat) => cat.id !== 'todos');

  return (
    <main className="conteudo-principal cardapio-main">
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
            id="pesquisa-cardapio"
            placeholder="Buscar no cardápio completo..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
          />
        </div>
      </section>

      <div id="container-categorias">
        {secoesCategorias.map((secao) => {
          const produtosDaCategoria = cardapioCompletoData.filter((prod) => {
            const pertenceCategoria = prod.categoria === secao.id;
            const batePesquisa =
              termoLimpo === '' || prod.nome.toLowerCase().includes(termoLimpo);
            return pertenceCategoria && batePesquisa;
          });

          // Esconde seções que ficaram sem nenhum card visível durante a pesquisa
          if (produtosDaCategoria.length === 0) {
            return null;
          }

          return (
            <section key={secao.id} className="secao-categoria">
              {termoLimpo === '' && (
                <h2 className="titulo-categoria">{secao.tituloSecao}</h2>
              )}
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
        })}
      </div>
    </main>
  );
}

export default Cardapio;
