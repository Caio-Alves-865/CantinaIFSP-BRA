import { useState, useRef, useEffect } from 'react';
import { obterPorcentagemDesconto } from '../data/produtosData';

function ProductCard({
  produto,
  classNameExtra = '',
  quantidade = 0,
  onAlterarQuantidade,
  onAbrirModal,
  usuarioLogado = null,
}) {
  const [promoSelecionado, setPromoSelecionado] = useState(false);
  const cardRef = useRef(null);

  const isPromocao = Boolean(produto?.emPromocao);
  const porcentagemDesconto = obterPorcentagemDesconto(produto);

  // Remove a borda dourada ativa ao clicar em qualquer outra parte do site (fora do card e do card do modal)
  useEffect(() => {
    if (!isPromocao || !promoSelecionado) return;

    const handleCliqueFora = (e) => {
      const clicouDentroDoCard = cardRef.current && cardRef.current.contains(e.target);
      const clicouDentroDoModalCard =
        e.target.closest && e.target.closest('.modal-produto-card');

      if (!clicouDentroDoCard && !clicouDentroDoModalCard) {
        setPromoSelecionado(false);
      }
    };

    document.addEventListener('mousedown', handleCliqueFora);
    return () => document.removeEventListener('mousedown', handleCliqueFora);
  }, [isPromocao, promoSelecionado]);

  const handleCardClick = () => {
    if (isPromocao) {
      setPromoSelecionado(true);
    }
    if (onAbrirModal) {
      onAbrirModal(produto);
    }
  };

  const handleAlterar = (e, delta) => {
    e.stopPropagation(); // Impede que o clique no + ou - abra o modal do card
    if (isPromocao) {
      setPromoSelecionado(true);
    }
    if (onAlterarQuantidade) {
      onAlterarQuantidade(produto.id, delta);
    }
  };

  const classesCard = [
    'card-produto',
    'card-clicavel',
    isPromocao ? 'card-promocao' : '',
    isPromocao && promoSelecionado ? 'card-promo-ativo' : '',
    classNameExtra,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={cardRef}
      className={classesCard}
      data-categoria={produto.categoria}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="container-img-card">
        <img src={produto.imagem} alt={produto.alt || produto.nome} />
        {isPromocao && porcentagemDesconto && (
          <span className="badge-desconto-card">{porcentagemDesconto}</span>
        )}
        {produto.imagens && produto.imagens.length > 1 && (
          <span
            className="badge-fotos-card"
            title="Clique para ver mais fotos e ingredientes"
          >
            {produto.imagens.length} fotos
          </span>
        )}
      </div>

      <div className="info-produto">
        <h4>{produto.nome}</h4>
        <p>{produto.descricao}</p>

        <div className="compra-produto">
          {isPromocao && produto.precoAntigo ? (
            <div className="bloco-precos-card">
              <span className="preco-antigo">{produto.precoAntigo}</span>
              <span className="preco preco-promocional">{produto.preco}</span>
            </div>
          ) : (
            <span className="preco">{produto.preco}</span>
          )}

          {/* Só exibe o botão de adicionar (+) e controle (-) se o usuário estiver logado */}
          {usuarioLogado && (
            <>
              {quantidade === 0 ? (
                <button
                  type="button"
                  className="btn-adicionar"
                  title="Adicionar item"
                  onClick={(e) => handleAlterar(e, 1)}
                >
                  +
                </button>
              ) : (
                <div
                  className="controle-qtd-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPromocao) setPromoSelecionado(true);
                  }}
                >
                  <button
                    type="button"
                    className="btn-qtd menos"
                    title="Remover um"
                    onClick={(e) => handleAlterar(e, -1)}
                  >
                    &minus;
                  </button>
                  <span className="valor-qtd">{quantidade}</span>
                  <button
                    type="button"
                    className="btn-qtd mais"
                    title="Adicionar mais um"
                    onClick={(e) => handleAlterar(e, 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
