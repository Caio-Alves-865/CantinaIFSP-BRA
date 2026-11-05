import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { historicoPedidosData, itensCarrinhoExemploData } from '../data/pedidosData';
import { destaquesData, promocoesData } from '../data/produtosData';
import '../styles/pedidos.css';

const todosProdutosCatalogo = [...destaquesData, ...promocoesData];

function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function Pedidos({ usuarioLogado, onAbrirModal }) {
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [itensCarrinho, setItensCarrinho] = useState(itensCarrinhoExemploData);
  const [observacaoPedido, setObservacaoPedido] = useState('');

  // Fecha o modal de detalhes do pedido com ESC
  useEffect(() => {
    if (!pedidoSelecionado) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPedidoSelecionado(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pedidoSelecionado]);

  // Se o usuário não estiver logado, redireciona para a página de login
  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  const alterarQtdCarrinho = (idItem, delta) => {
    setItensCarrinho((prev) =>
      prev
        .map((item) =>
          item.id === idItem
            ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const valorTotalNumerico = itensCarrinho.reduce(
    (acc, item) => acc + (item.precoNumerico || 0) * item.quantidade,
    0
  );
  const totalFormatado = formatarMoeda(valorTotalNumerico);

  const abrirDetalhesProdutoCatalogo = (idProduto) => {
    if (!onAbrirModal) return;
    const encontrado = todosProdutosCatalogo.find((p) => p.id === idProduto);
    if (encontrado) {
      onAbrirModal(encontrado);
    }
  };

  return (
    <>
      <main className="conteudo-principal pedidos-main">
        <div className="layout-pedidos">
          <section className="secao-historico">
            <div className="titulo-com-icone-pedidos">
              <div className="icone-secao-pedidos" aria-hidden="true">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h2>Histórico de Compras</h2>
            </div>
            <p className="subtitulo-secao">
              Clique em qualquer compra abaixo para visualizar os cards dos produtos do
              pedido.
            </p>

            <div className="lista-historico">
              {historicoPedidosData.map((pedido) => (
                <div
                  key={pedido.id}
                  className="card-pedido card-pedido-clicavel"
                  onClick={() => setPedidoSelecionado(pedido)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPedidoSelecionado(pedido);
                    }
                  }}
                >
                  <div className="cabecalho-pedido">
                    <span className="numero-pedido">{pedido.numero}</span>
                    <span className="data-pedido">{pedido.data}</span>
                    <span className={`status-pedido ${pedido.classeStatus}`}>
                      {pedido.status}
                    </span>
                  </div>
                  <div className="corpo-pedido">
                    <ul className="itens-comprados">
                      {pedido.itens.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <div className="total-pedido">
                      <span>Total Pago:</span>
                      <strong>{pedido.total}</strong>
                      <span className="dica-ver-itens">Ver produtos &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="secao-carrinho">
            <div className="widget-carrinho">
              <div className="cabecalho-widget-carrinho">
                <div className="icone-secao-pedidos" aria-hidden="true">
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
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h2>Seu Carrinho</h2>
              </div>

              <div className="itens-carrinho">
                {itensCarrinho.length === 0 ? (
                  <p className="carrinho-vazio-msg">Seu carrinho está vazio no momento.</p>
                ) : (
                  itensCarrinho.map((item) => (
                    <div
                      key={item.id}
                      className="item-carrinho item-carrinho-clicavel"
                      onClick={() => abrirDetalhesProdutoCatalogo(item.id)}
                      title="Clique para ver detalhes do produto"
                    >
                      <img src={item.imagem} alt={item.nome} />
                      <div className="info-item-carrinho">
                        <h4>{item.nome}</h4>
                        <span className="preco-item">{item.preco}</span>
                      </div>
                      <div
                        className="controle-quantidade"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => alterarQtdCarrinho(item.id, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => alterarQtdCarrinho(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Campo de Observações do Pedido */}
              <div className="bloco-observacao-carrinho">
                <label htmlFor="observacao-pedido">
                  <span>Observações do Pedido</span>
                  <small>Opcional</small>
                </label>
                <textarea
                  id="observacao-pedido"
                  rows="3"
                  value={observacaoPedido}
                  onChange={(e) => setObservacaoPedido(e.target.value)}
                  placeholder="Ex: Quero a Coca gelada, hambúrguer sem queijo, enviar talher descartável..."
                />
              </div>

              <div className="resumo-carrinho">
                <div className="linha-resumo">
                  <span>Subtotal</span>
                  <span>{totalFormatado}</span>
                </div>
                <div className="linha-resumo total">
                  <span>Total</span>
                  <span>{totalFormatado}</span>
                </div>
                <button
                  type="button"
                  className="btn-finalizar"
                  disabled={itensCarrinho.length === 0}
                  onClick={() => setModalCheckoutAberto(true)}
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal com os Cards dos Produtos Comprados naquele Pedido */}
      {pedidoSelecionado && (
        <div
          className="modal-overlay ativo"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) {
              setPedidoSelecionado(null);
            }
          }}
        >
          <div className="modal-detalhes-pedido" role="dialog" aria-modal="true">
            <div className="cabecalho-modal-pedido">
              <div>
                <div className="topo-titulo-modal-pedido">
                  <h3>{pedidoSelecionado.numero}</h3>
                  <span className={`status-pedido ${pedidoSelecionado.classeStatus}`}>
                    {pedidoSelecionado.status}
                  </span>
                </div>
                <p className="data-modal-pedido">Realizado em {pedidoSelecionado.data}</p>
              </div>
              <button
                type="button"
                className="btn-fechar"
                onClick={() => setPedidoSelecionado(null)}
                aria-label="Fechar detalhes do pedido"
              >
                &times;
              </button>
            </div>

            <div className="grade-cards-pedido-modal">
              {pedidoSelecionado.produtosDetalhados?.map((prod) => (
                <article
                  key={prod.id}
                  className="card-produto-comprado"
                  onClick={() => abrirDetalhesProdutoCatalogo(prod.id)}
                  title="Clique para ver ingredientes e detalhes deste produto"
                >
                  <div className="img-wrapper-comprado">
                    <img src={prod.imagem} alt={prod.nome} />
                    <span className="badge-qtd-comprada">{prod.quantidade}x</span>
                  </div>
                  <div className="info-produto-comprado">
                    <span className="categoria-comprado">{prod.categoria}</span>
                    <h4>{prod.nome}</h4>
                    <p>{prod.descricao}</p>
                    <div className="rodape-card-comprado">
                      <span className="rotulo-unitario">Unidade:</span>
                      <strong className="preco-comprado">{prod.precoUnitario}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {pedidoSelecionado.observacao && (
              <div className="box-observacao-registrada">
                <strong>Observação enviada no pedido:</strong>
                <p>“{pedidoSelecionado.observacao}”</p>
              </div>
            )}

            <div className="rodape-modal-pedido">
              <span>Valor Total do Pedido</span>
              <strong>{pedidoSelecionado.total}</strong>
            </div>
          </div>
        </div>
      )}

      <CheckoutModal
        aberto={modalCheckoutAberto}
        onFechar={() => setModalCheckoutAberto(false)}
        nomeInicial={usuarioLogado || 'Fabricio'}
        total={totalFormatado}
        observacao={observacaoPedido}
      />
    </>
  );
}

export default Pedidos;
