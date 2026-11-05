import { useState, useEffect } from 'react';
import { obterPerfilUsuarioAtual } from '../utils/usuarioStorage';

function CheckoutModal({ aberto, onFechar, nomeInicial = 'Fabricio', total = 'R$ 14,00' }) {
  // 'formulario' | 'pix' | 'cartao_app' | 'sucesso' | 'sucesso_pago'
  const [etapa, setEtapa] = useState('formulario');
  const [nomeRetirada, setNomeRetirada] = useState(nomeInicial);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [modalidadeCartao, setModalidadeCartao] = useState('app'); // 'app' | 'caixa'
  const [funcaoCartao, setFuncaoCartao] = useState('credito'); // 'credito' | 'debito'

  // Estados do simulador de cartão no aplicativo
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [cvvCartao, setCvvCartao] = useState('');
  const [erroCartao, setErroCartao] = useState('');
  const [processandoCartao, setProcessandoCartao] = useState(false);

  const [tempoRestante, setTempoRestante] = useState(5 * 60);
  const [copiado, setCopiado] = useState(false);

  // Reseta o modal sempre que ele é aberto, aplicando o nome e método de pagamento padrão salvos nas Configurações
  useEffect(() => {
    if (aberto) {
      const perfil = obterPerfilUsuarioAtual(nomeInicial);
      setEtapa('formulario');
      setNomeRetirada(perfil.nome || nomeInicial);
      setMetodoPagamento(perfil.pagamentoPadrao || 'pix');
      setModalidadeCartao('app');
      setFuncaoCartao('credito');
      setNumeroCartao('');
      setNomeCartao('');
      setValidadeCartao('');
      setCvvCartao('');
      setErroCartao('');
      setProcessandoCartao(false);
      setTempoRestante(5 * 60);
      setCopiado(false);
    }
  }, [aberto, nomeInicial]);

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

  // Máscaras de digitação do cartão
  const handleNumeroCartaoChange = (e) => {
    const apenasDigitos = e.target.value.replace(/\D/g, '').slice(0, 16);
    const grupos = apenasDigitos.match(/.{1,4}/g) || [];
    setNumeroCartao(grupos.join(' '));
    if (erroCartao) setErroCartao('');
  };

  const handleNomeCartaoChange = (e) => {
    const texto = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase();
    setNomeCartao(texto);
    if (erroCartao) setErroCartao('');
  };

  const handleValidadeCartaoChange = (e) => {
    const apenasDigitos = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (apenasDigitos.length >= 3) {
      setValidadeCartao(`${apenasDigitos.slice(0, 2)}/${apenasDigitos.slice(2)}`);
    } else {
      setValidadeCartao(apenasDigitos);
    }
    if (erroCartao) setErroCartao('');
  };

  const handleCvvCartaoChange = (e) => {
    const apenasDigitos = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvvCartao(apenasDigitos);
    if (erroCartao) setErroCartao('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (metodoPagamento === 'pix') {
      setTempoRestante(5 * 60);
      setEtapa('pix');
    } else if (metodoPagamento === 'cartao') {
      if (modalidadeCartao === 'app') {
        setErroCartao('');
        setEtapa('cartao_app');
      } else {
        setEtapa('sucesso');
      }
    } else {
      setEtapa('sucesso');
    }
  };

  const handlePagarComCartaoApp = (e) => {
    e.preventDefault();
    const digitosNumero = numeroCartao.replace(/\D/g, '');
    const digitosValidade = validadeCartao.replace(/\D/g, '');

    if (digitosNumero.length < 16) {
      setErroCartao('Digite os 16 números do cartão.');
      return;
    }
    if (nomeCartao.trim().length < 3) {
      setErroCartao('Informe o nome impresso no cartão.');
      return;
    }
    if (digitosValidade.length < 4) {
      setErroCartao('Informe a validade completa no formato MM/AA.');
      return;
    }
    const mes = parseInt(digitosValidade.slice(0, 2), 10);
    if (mes < 1 || mes > 12) {
      setErroCartao('O mês de validade deve estar entre 01 e 12.');
      return;
    }
    if (cvvCartao.length < 3) {
      setErroCartao('Informe os 3 dígitos do código de segurança (CVV).');
      return;
    }

    setErroCartao('');
    setProcessandoCartao(true);
    setTimeout(() => {
      setProcessandoCartao(false);
      setEtapa('sucesso_pago');
    }, 1100);
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
    if (e.target.id === 'modal-pagamento' && !processandoCartao) {
      onFechar();
    }
  };

  const ultimosDigitosCartao = numeroCartao.replace(/\D/g, '').slice(-4) || '0000';

  return (
    <div
      className={`modal-overlay ${aberto ? 'ativo' : ''}`}
      id="modal-pagamento"
      onClick={handleOverlayClick}
    >
      <div
        className={`modal-checkout ${
          etapa === 'sucesso' || etapa === 'sucesso_pago' ? 'tema-verde' : ''
        }`}
      >
        <div className="corpo-modal">
          <div className="cabecalho-modal">
            <h3>
              {etapa === 'cartao_app' ? 'Pagamento com Cartão' : 'Finalizar Pedido'}
            </h3>
            <button
              type="button"
              className="btn-fechar"
              id="fechar-modal"
              onClick={onFechar}
              disabled={processandoCartao}
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

                  {metodoPagamento === 'cartao' && (
                    <div className="subopcoes-cartao-container">
                      <span className="subopcoes-cartao-titulo">
                        Onde deseja passar o cartão?
                      </span>
                      <div className="subopcoes-cartao-grid">
                        <button
                          type="button"
                          className={`btn-subopcao-cartao ${
                            modalidadeCartao === 'app' ? 'ativo' : ''
                          }`}
                          onClick={() => setModalidadeCartao('app')}
                        >
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
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          <div>
                            <strong>No Aplicativo</strong>
                            <small>Simular pagamento online</small>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`btn-subopcao-cartao ${
                            modalidadeCartao === 'caixa' ? 'ativo' : ''
                          }`}
                          onClick={() => setModalidadeCartao('caixa')}
                        >
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
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          <div>
                            <strong>Lá no Caixa</strong>
                            <small>Na maquininha ao retirar</small>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

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
                {metodoPagamento === 'cartao' && modalidadeCartao === 'app'
                  ? `Dados do Cartão (${total})`
                  : `Confirmar e Pagar ${total}`}
              </button>
            </form>
          )}

          {etapa === 'cartao_app' && (
            <form className="form-cartao-simulador" onSubmit={handlePagarComCartaoApp}>
              <div className="seletor-funcao-cartao">
                <button
                  type="button"
                  className={`aba-funcao-cartao ${
                    funcaoCartao === 'credito' ? 'ativa' : ''
                  }`}
                  onClick={() => setFuncaoCartao('credito')}
                >
                  Crédito (À vista)
                </button>
                <button
                  type="button"
                  className={`aba-funcao-cartao ${
                    funcaoCartao === 'debito' ? 'ativa' : ''
                  }`}
                  onClick={() => setFuncaoCartao('debito')}
                >
                  Débito
                </button>
              </div>

              {/* Cartão Visual Interativo */}
              <div className="cartao-visual-preview">
                <div className="cartao-visual-topo">
                  <div className="cartao-chip-icone" />
                  <span className="cartao-badge-funcao">
                    {funcaoCartao === 'credito' ? 'CRÉDITO' : 'DÉBITO'}
                  </span>
                </div>

                <div className="cartao-visual-numero">
                  {numeroCartao || '•••• •••• •••• ••••'}
                </div>

                <div className="cartao-visual-rodape">
                  <div className="cartao-visual-bloco">
                    <small>TITULAR DO CARTÃO</small>
                    <span>{nomeCartao || 'SEU NOME AQUI'}</span>
                  </div>
                  <div className="cartao-visual-bloco validade">
                    <small>VALIDADE</small>
                    <span>{validadeCartao || 'MM/AA'}</span>
                  </div>
                </div>
              </div>

              <div className="grupo-input">
                <label htmlFor="num-cartao-input">Número do Cartão</label>
                <input
                  type="text"
                  id="num-cartao-input"
                  placeholder="0000 0000 0000 0000"
                  value={numeroCartao}
                  onChange={handleNumeroCartaoChange}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>

              <div className="grupo-input">
                <label htmlFor="nome-cartao-input">Nome Impresso no Cartão</label>
                <input
                  type="text"
                  id="nome-cartao-input"
                  placeholder="Ex: FABRICIO S SOARES"
                  value={nomeCartao}
                  onChange={handleNomeCartaoChange}
                  autoComplete="off"
                />
              </div>

              <div className="linha-inputs-cartao">
                <div className="grupo-input">
                  <label htmlFor="validade-cartao-input">Validade</label>
                  <input
                    type="text"
                    id="validade-cartao-input"
                    placeholder="MM/AA"
                    value={validadeCartao}
                    onChange={handleValidadeCartaoChange}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="cvv-cartao-input">CVV</label>
                  <input
                    type="text"
                    id="cvv-cartao-input"
                    placeholder="123"
                    value={cvvCartao}
                    onChange={handleCvvCartaoChange}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>
              </div>

              {erroCartao && <p className="erro-cartao-msg">{erroCartao}</p>}

              <div className="acoes-cartao-simulador">
                <button
                  type="button"
                  className="btn-voltar-checkout"
                  onClick={() => setEtapa('formulario')}
                  disabled={processandoCartao}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-confirmar-pagamento"
                  disabled={processandoCartao}
                >
                  {processandoCartao
                    ? 'Processando pagamento...'
                    : `Pagar ${total}`}
                </button>
              </div>
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
                  {metodoPagamento === 'cartao'
                    ? 'Por favor, dirija-se ao caixa da cantina para passar seu cartão na maquininha e retirar seu pedido.'
                    : 'Por favor, dirija-se ao caixa da cantina para realizar o pagamento e aguardar a sua senha.'}
                </p>
                <p className="senha-destaque">
                  Sua Senha: <strong>1043</strong>
                </p>
              </div>
            </div>
          )}

          {etapa === 'sucesso_pago' && (
            <div id="tela-sucesso-pago">
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
                <h4>Pagamento Aprovado!</h4>
                <p>
                  Seu pagamento de <strong>{total}</strong> no{' '}
                  <strong>
                    Cartão de {funcaoCartao === 'credito' ? 'Crédito' : 'Débito'} (final{' '}
                    {ultimosDigitosCartao})
                  </strong>{' '}
                  foi confirmado pelo aplicativo. Seu pedido já entrou em preparo!
                </p>
                <p className="senha-destaque">
                  Sua Senha de Retirada: <strong>1043</strong>
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
