function ProductCard({
  produto,
  classNameExtra = '',
  quantidade = 0,
  onAlterarQuantidade,
  onAbrirModal,
  usuarioLogado = null,
}) {
  const handleCardClick = () => {
    if (onAbrirModal) {
      onAbrirModal(produto);
    }
  };

  const handleAlterar = (e, delta) => {
    e.stopPropagation(); // Impede que o clique no + ou - abra o modal do card
    if (onAlterarQuantidade) {
      onAlterarQuantidade(produto.id, delta);
    }
  };

  return (
    <div
      className={`card-produto card-clicavel ${classNameExtra}`.trim()}
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

        <div className="compra-produto" onClick={(e) => e.stopPropagation()}>
          <span className="preco">{produto.preco}</span>

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
                <div className="controle-qtd-card">
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
