import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const nomesCategoria = {
  salgado: 'Salgados',
  doce: 'Doces & Sobremesas',
  bebida: 'Bebidas',
  prato: 'Pratos & Combos',
};

function ProductModal({
  produto,
  onFechar,
  quantidade = 0,
  onAlterarQuantidade,
  usuarioLogado = null,
}) {
  const [fotoIndex, setFotoIndex] = useState(0);

  const listaFotos =
    produto?.imagens && produto.imagens.length > 0
      ? produto.imagens
      : produto
      ? [produto.imagem]
      : [];

  // Reseta para a primeira foto ao abrir um produto novo
  useEffect(() => {
    setFotoIndex(0);
  }, [produto]);

  // Troca automática de fotos caso o produto tenha mais de uma imagem cadastrada
  useEffect(() => {
    if (!produto || listaFotos.length <= 1) return;

    const timer = setInterval(() => {
      setFotoIndex((prev) => (prev + 1) % listaFotos.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [produto, listaFotos.length]);

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    if (!produto) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produto, onFechar]);

  if (!produto) return null;

  const moverFoto = (direcao) => {
    setFotoIndex((prev) => (prev + direcao + listaFotos.length) % listaFotos.length);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-produto-overlay')) {
      onFechar();
    }
  };

  return (
    <div className="modal-produto-overlay ativo" onClick={handleOverlayClick}>
      <div className="modal-produto-card" role="dialog" aria-modal="true">
        <button
          type="button"
          className="btn-fechar-modal-produto"
          onClick={onFechar}
          aria-label="Fechar detalhes do produto"
        >
          &times;
        </button>

        {/* Galeria / Carrossel de Fotos do Produto */}
        <div className="galeria-modal-produto">
          {listaFotos.map((foto, idx) => (
            <img
              key={idx}
              src={foto}
              alt={`${produto.nome} - Foto ${idx + 1}`}
              className={`foto-modal-slide ${idx === fotoIndex ? 'ativo' : ''}`}
            />
          ))}

          {listaFotos.length > 1 && (
            <>
              <button
                type="button"
                className="seta-galeria-modal anterior"
                onClick={() => moverFoto(-1)}
                aria-label="Foto anterior"
              >
                &#10094;
              </button>
              <button
                type="button"
                className="seta-galeria-modal proxima"
                onClick={() => moverFoto(1)}
                aria-label="Próxima foto"
              >
                &#10095;
              </button>

              <div className="indicadores-galeria-modal">
                {listaFotos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ponto-galeria ${idx === fotoIndex ? 'ativo' : ''}`}
                    onClick={() => setFotoIndex(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conteúdo Detalhado do Produto */}
        <div className="corpo-modal-produto">
          <div className="cabecalho-info-modal">
            <span className="tag-categoria-modal">
              {nomesCategoria[produto.categoria] || 'Cardápio'}
            </span>
            <h3>{produto.nome}</h3>
          </div>

          <p className="descricao-detalhada-modal">
            {produto.descricaoDetalhada || produto.descricao}
          </p>

          {produto.ingredientes && produto.ingredientes.length > 0 && (
            <div className="secao-ingredientes-modal">
              <h4>Ingredientes e Composição</h4>
              <ul className="lista-ingredientes-modal">
                {produto.ingredientes.map((ingrediente, idx) => (
                  <li key={idx} className="tag-ingrediente">
                    {ingrediente}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rodapé do Modal: Preço + Controle de Quantidade (- / +) apenas se logado */}
          <div className="rodape-modal-produto">
            <div className="bloco-preco-modal">
              <span className="rotulo-preco-modal">Preço unitário</span>
              <strong className="valor-preco-modal">{produto.preco}</strong>
            </div>

            {usuarioLogado ? (
              <div className="acoes-compra-modal">
                {quantidade === 0 ? (
                  <button
                    type="button"
                    className="btn-adicionar-modal-inicial"
                    onClick={() => onAlterarQuantidade(produto.id, 1)}
                  >
                    <span>Adicionar</span>
                    <span className="simbolo-mais">+</span>
                  </button>
                ) : (
                  <div className="controle-qtd-card controle-qtd-modal">
                    <button
                      type="button"
                      className="btn-qtd menos"
                      title="Remover um"
                      onClick={() => onAlterarQuantidade(produto.id, -1)}
                    >
                      &minus;
                    </button>
                    <span className="valor-qtd">{quantidade}</span>
                    <button
                      type="button"
                      className="btn-qtd mais"
                      title="Adicionar mais um"
                      onClick={() => onAlterarQuantidade(produto.id, 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="link-login-modal"
                onClick={onFechar}
              >
                Entre para fazer pedidos
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
