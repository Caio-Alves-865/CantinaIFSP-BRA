import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obterPorcentagemDesconto } from '../data/produtosData';
import { obterPerfilUsuarioAtual } from '../utils/usuarioStorage';

const nomesCategoria = {
  salgado: 'Salgados',
  doce: 'Doces & Sobremesas',
  bebida: 'Bebidas',
  prato: 'Pratos & Combos',
};

// Retorna a lista de grupos alergênicos identificados em um texto de ingrediente
function obterGruposAlergenicos(textoIngrediente) {
  const texto = textoIngrediente.toLowerCase();

  const temGluten =
    texto.includes('farinha de rosca') ||
    texto.includes('trigo') ||
    texto.includes('glúten') ||
    texto.includes('pão') ||
    texto.includes('lanche especial');

  const temLeite =
    texto.includes('leite') ||
    texto.includes('queijo') ||
    texto.includes('requeijão') ||
    texto.includes('manteiga') ||
    texto.includes('cheddar') ||
    texto.includes('sundae');

  const temOvo = texto.includes('ovo');
  const temGergelim = texto.includes('gergelim');
  const temAmendoim =
    texto.includes('amendoim') || texto.includes('castanha') || texto.includes('nozes');
  const temFrutosDoMar =
    texto.includes('camarão') || texto.includes('peixe') || texto.includes('frutos do mar');

  const alertas = [];
  if (temGluten) alertas.push('Glúten');
  if (temLeite) alertas.push('Leite / Lactose');
  if (temOvo) alertas.push('Ovo');
  if (temGergelim) alertas.push('Gergelim');
  if (temAmendoim) alertas.push('Amendoim / Oleaginosas');
  if (temFrutosDoMar) alertas.push('Frutos do Mar');

  return alertas;
}

function ProductModal({
  produto,
  onFechar,
  quantidade = 0,
  onAlterarQuantidade,
  usuarioLogado = null,
}) {
  const [fotoIndex, setFotoIndex] = useState(0);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState(null);

  const listaFotos =
    produto?.imagens && produto.imagens.length > 0
      ? produto.imagens
      : produto
      ? [produto.imagem]
      : [];

  // Reseta para a primeira foto e fecha avisos de alergia ao abrir um produto novo
  useEffect(() => {
    setFotoIndex(0);
    setIngredienteSelecionado(null);
  }, [produto]);

  // Troca automática de fotos caso o produto tenha mais de uma imagem cadastrada
  useEffect(() => {
    if (!produto || listaFotos.length <= 1) return;

    const timer = setInterval(() => {
      // Respeita a preferência de acessibilidade "Reduzir Animações" das Configurações
      if (document.documentElement.classList.contains('reduzir-movimento')) return;
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

  const isPromocao = Boolean(produto.emPromocao);
  const porcentagemDesconto = obterPorcentagemDesconto(produto);

  // Preferências de alergia do perfil (3 estados por grupo):
  // - "Tenho alergia" (alergias)        -> alerta reforçado
  // - Padrão (não marcado)               -> aviso genérico do site
  // - "Não tenho" (alergiasSemAviso)     -> oculta o aviso genérico daquele grupo
  const perfilUsuario = usuarioLogado ? obterPerfilUsuarioAtual(usuarioLogado) : null;
  const alergiasMarcadasNoPerfil = Array.isArray(perfilUsuario?.alergias)
    ? perfilUsuario.alergias
    : [];
  const alergiasSemAviso = Array.isArray(perfilUsuario?.alergiasSemAviso)
    ? perfilUsuario.alergiasSemAviso
    : [];

  // Grupos alergênicos de um ingrediente que ainda devem ser avisados para este usuário
  const obterGruposVisiveis = (ingrediente) =>
    obterGruposAlergenicos(ingrediente).filter((g) => !alergiasSemAviso.includes(g));

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
      <div
        className={`modal-produto-card ${isPromocao ? 'modal-promocao' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
      >
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
          {isPromocao && porcentagemDesconto && (
            <span className="badge-desconto-card badge-desconto-modal">
              {porcentagemDesconto}
            </span>
          )}
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
        <div
          className="corpo-modal-produto"
          onClick={() => setIngredienteSelecionado(null)}
        >
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
                {produto.ingredientes.map((ingrediente, idx) => {
                  const gruposVisiveis = obterGruposVisiveis(ingrediente);
                  const avisoAlergia =
                    gruposVisiveis.length > 0
                      ? `Alérgicos — Contém ${gruposVisiveis.join(' e ')}`
                      : null;
                  const isAlergiaDoPerfil = gruposVisiveis.some((g) =>
                    alergiasMarcadasNoPerfil.includes(g)
                  );
                  const isAtivo = ingredienteSelecionado?.idx === idx;

                  if (!avisoAlergia) {
                    return (
                      <li key={idx} className="tag-ingrediente">
                        {ingrediente}
                      </li>
                    );
                  }

                  return (
                    <li
                      key={idx}
                      className={`tag-ingrediente alergenico ${
                        isAlergiaDoPerfil ? 'alergia-perfil' : ''
                      } ${isAtivo ? 'ativo' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const alinharDireita = e.currentTarget.offsetLeft > 150;
                        setIngredienteSelecionado(
                          isAtivo
                            ? null
                            : { idx, aviso: avisoAlergia, alinharDireita }
                        );
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          const alinharDireita = e.currentTarget.offsetLeft > 150;
                          setIngredienteSelecionado(
                            isAtivo
                              ? null
                              : { idx, aviso: avisoAlergia, alinharDireita }
                          );
                        }
                      }}
                    >
                      <span className="icone-info-alergia" aria-hidden="true">
                        {isAlergiaDoPerfil ? '⚠' : 'ⓘ'}
                      </span>
                      <span className="texto-ingrediente-modal">{ingrediente}</span>

                      {isAtivo && (
                        <span
                          className={`balao-alergia-popover ${
                            ingredienteSelecionado?.alinharDireita
                              ? 'alinhar-direita'
                              : ''
                          }`}
                          role="status"
                        >
                          {avisoAlergia}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Rodapé do Modal: Preço + Controle de Quantidade (- / +) apenas se logado */}
          <div className="rodape-modal-produto">
            <div className="bloco-preco-modal">
              <span className="rotulo-preco-modal">Preço unitário</span>
              {isPromocao && produto.precoAntigo ? (
                <div className="linha-precos-modal">
                  <span className="preco-antigo preco-antigo-modal">
                    {produto.precoAntigo}
                  </span>
                  <strong className="valor-preco-modal valor-preco-modal-promo">
                    {produto.preco}
                  </strong>
                </div>
              ) : (
                <strong className="valor-preco-modal">{produto.preco}</strong>
              )}
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
