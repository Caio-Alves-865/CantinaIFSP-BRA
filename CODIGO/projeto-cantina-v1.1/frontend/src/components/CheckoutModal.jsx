import { useState, useEffect } from 'react';

function CheckoutModal({ aberto, onFechar, nomeInicial = 'Fabricio', total = 'R$ 14,00' }) {
  const [etapa, setEtapa] = useState('formulario'); // 'formulario' | 'pix' | 'sucesso'
  const [nomeRetirada, setNomeRetirada] = useState(nomeInicial);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [tempoRestante, setTempoRestante] = useState(5 * 60);
  const [copiado, setCopiado] = useState(false);

  // Reseta o modal sempre que ele é aberto
  useEffect(() => {
    if (aberto) {
      setEtapa('formulario');
      setMetodoPagamento('pix');
      setTempoRestante(5 * 60);
      setCopiado(false);
    }
  }, [aberto]);

  // Cronômetro regressivo do PIX
  useEffect(() => {
    if (!aberto || etapa !== 'pix') return;

    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [aberto, etapa]);

  const formatarTempo = (segundosTotais) => {
    if (segundosTotais <= 0) return 'Expirado';
    const min = String(Math.floor(segundosTotais / 60)).padStart(2, '0');
    const seg = String(segundosTotais % 60).padStart(2, '0');
    return `${min}:${seg}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (metodoPagamento === 'pix') {
      setTempoRestante(5 * 60);
      setEtapa('pix');
    } else {
      setEtapa('sucesso');
    }
  };

  const handleCopiarPix = () => {
    const codigoPix = '00020126580014br.gov.bcb.pix0136cantina-digital...';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codigoPix);
    }
    setCopiado(true);
    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-pagamento') {
      onFechar();
    }
  };

  return (
    <div
      className={`modal-overlay ${aberto ? 'ativo' : ''}`}
      id="modal-pagamento"
      onClick={handleOverlayClick}
    >
      <div className={`modal-checkout ${etapa === 'sucesso' ? 'tema-verde' : ''}`}>
        <div className="corpo-modal">
          <div className="cabecalho-modal">
            <h3>Finalizar Pedido</h3>
            <button
              type="button"
              className="btn-fechar"
              id="fechar-modal"
              onClick={onFechar}
            >
              &times;
            </button>
          </div>

          {etapa === 'formulario' && (
            <form id="form-checkout" onSubmit={handleSubmit}>
              <div className="grupo-input">
                <label htmlFor="nome-retirada">Nome para ser chamado</label>
                <input
                  type="text"
                  id="nome-retirada"
                  value={nomeRetirada}
                  onChange={(e) => setNomeRetirada(e.target.value)}
                  required
                />
              </div>

              <div className="info-retirada">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  Tempo estimado de preparo: <strong>10 a 15 minutos</strong>
                </span>
              </div>

              <div className="grupo-input">
                <label>Método de Pagamento</label>
                <div className="opcoes-pagamento">
                  <label className="opcao-radio">
                    <input
                      type="radio"
                      name="pagamento"
                      value="pix"
                      checked={metodoPagamento === 'pix'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                    />
                    <span className="box-radio">PIX (Aprovação na hora)</span>
                  </label>
                  <label className="opcao-radio">
                    <input
                      type="radio"
                      name="pagamento"
                      value="cartao"
                      checked={metodoPagamento === 'cartao'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                    />
                    <span className="box-radio">Cartão de Crédito/Débito</span>
                  </label>
                  <label className="opcao-radio">
                    <input
                      type="radio"
                      name="pagamento"
                      value="balcao"
                      checked={metodoPagamento === 'balcao'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                    />
                    <span className="box-radio">Pagar na Retirada (Dinheiro)</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-confirmar-pagamento">
                Confirmar e Pagar {total}
              </button>
            </form>
          )}

          {etapa === 'pix' && (
            <div id="tela-pix">
              <div className="pix-container">
                <h4>Pague com PIX</h4>
                <p>Escaneie o QR Code abaixo para confirmar seu pedido.</p>

                <div className="qr-code-svg-wrapper" aria-label="QR Code PIX">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="190"
                    height="190"
                    viewBox="0 0 120 120"
                    className="qr-code-img"
                  >
                    <rect width="120" height="120" rx="8" fill="#ece5cb" />
                    {/* Cantos de posicionamento do QR Code */}
                    <path
                      fill="#353e3d"
                      d="M12 12h30v30H12V12zm6 6v18h18V18H18zm6 6h6v6h-6v-6zm54-12h30v30H78V12zm6 6v18h18V18H84zm6 6h6v6h-6v-6zM12 78h30v30H12V78zm6 6v18h18V84H18zm6 6h6v6h-6v-6z"
                    />
                    {/* Módulos centrais simulando dados PIX */}
                    <path
                      fill="#353e3d"
                      d="M48 12h6v6h-6zm12 0h6v12h-6zm-6 12h6v6h-6zm-6 6h6v12h-6zm18 0h6v6h-6zM48 48h12v6H48zm18 0h6v12h-6zM12 48h12v6H12zm18 6h12v6H30zm-18 12h6v6h-6zm12 0h6v6h-6zm18-6h6v12h-6zm18 6h12v6H60zm18-12h6v6h-6zm12 0h18v6H90zm-6 12h12v6H84zm18 6h6v12h-6zM48 78h6v12h-6zm12-6h6v12h-6zm12 6h12v6H72zm-12 18h12v6H60zm-12 6h6v6h-6zm24 0h6v6h-6zm12-12h12v12H84zm18 6h6v12h-6zm-12 12h12v6H90z"
                    />
                  </svg>
                </div>

                <div className="tempo-pix">
                  <span>O código expira em:</span>
                  <strong id="cronometro-pix">{formatarTempo(tempoRestante)}</strong>
                </div>

                <div className="copia-cola-container">
                  <input
                    type="text"
                    value="00020126580014br.gov.bcb.pix0136cantina-serra-soares..."
                    id="codigo-pix"
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn-copiar"
                    onClick={handleCopiarPix}
                    style={{
                      backgroundColor: copiado ? 'var(--cor-secundaria)' : 'var(--cor-destaque)',
                    }}
                  >
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {etapa === 'sucesso' && (
            <div id="tela-sucesso">
              <div className="sucesso-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#66723b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icone-sucesso"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h4>Pedido Registrado!</h4>
                <p>
                  Por favor, dirija-se ao caixa da cantina para realizar o pagamento e
                  aguardar a sua senha.
                </p>
                <p className="senha-destaque">
                  Sua Senha: <strong>1043</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
