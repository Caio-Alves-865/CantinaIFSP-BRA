import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import { historicoPedidosData, itensCarrinhoExemploData } from '../data/pedidosData';
import '../styles/pedidos.css';

function Pedidos({ usuarioLogado }) {
  const [modalAberto, setModalAberto] = useState(false);

  // Se o usuário não estiver logado, redireciona para a página de login
  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <main className="conteudo-principal pedidos-main">
        <div className="layout-pedidos">
          <section className="secao-historico">
            <h2>Histórico de Compras</h2>
            <p className="subtitulo-secao">Acompanhe seus pedidos anteriores.</p>

            <div className="lista-historico">
              {historicoPedidosData.map((pedido) => (
                <div key={pedido.id} className="card-pedido">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="secao-carrinho">
            <div className="widget-carrinho">
              <h2>Seu Carrinho</h2>

              <div className="itens-carrinho">
                {itensCarrinhoExemploData.map((item) => (
                  <div key={item.id} className="item-carrinho">
                    <img src={item.imagem} alt={item.nome} />
                    <div className="info-item-carrinho">
                      <h4>{item.nome}</h4>
                      <span className="preco-item">{item.preco}</span>
                    </div>
                    <div className="controle-quantidade">
                      <button type="button">-</button>
                      <span>{item.quantidade}</span>
                      <button type="button">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="resumo-carrinho">
                <div className="linha-resumo">
                  <span>Subtotal</span>
                  <span>R$ 14,00</span>
                </div>
                <div className="linha-resumo total">
                  <span>Total</span>
                  <span>R$ 14,00</span>
                </div>
                <button
                  type="button"
                  className="btn-finalizar"
                  onClick={() => setModalAberto(true)}
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <CheckoutModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        nomeInicial={usuarioLogado || 'Fabricio'}
        total="R$ 14,00"
      />
    </>
  );
}

export default Pedidos;
