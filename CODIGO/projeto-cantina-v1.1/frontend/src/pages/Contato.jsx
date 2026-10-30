import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/contato.css';

const opcoesAssunto = [
  { valor: 'duvida', rotulo: 'Dúvida sobre o cardápio' },
  { valor: 'sugestao', rotulo: 'Sugestão de lanche' },
  { valor: 'problema', rotulo: 'Problema com pedido' },
  { valor: 'outro', rotulo: 'Outros' },
];

function Contato({ usuarioLogado }) {
  const [assuntoSelecionado, setAssuntoSelecionado] = useState(null);
  const [selectAberto, setSelectAberto] = useState(false);
  const [erroAssunto, setErroAssunto] = useState(false);
  const [toasts, setToasts] = useState([]);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setSelectAberto(false);
      }
    }
    document.addEventListener('click', handleClickFora);
    return () => document.removeEventListener('click', handleClickFora);
  }, []);

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assuntoSelecionado) {
      setErroAssunto(true);
      mostrarToast('Por favor, selecione um assunto antes de enviar.', 'erro');
      return;
    }
    setErroAssunto(false);
    mostrarToast('Mensagem enviada com sucesso! Responderemos em breve.', 'sucesso');
    setAssuntoSelecionado(null);
    e.target.reset();
  };

  return (
    <main className="conteudo-principal contato-main">
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tipo}`}>
            <span className="indicador-toast"></span>
            <p style={{ margin: 0 }}>{toast.mensagem}</p>
          </div>
        ))}
      </div>

      <div className="cabecalho-pagina">
        <h2>Fale com a Cantina</h2>
        <p>
          Dúvidas, sugestões ou problemas com seu pedido? Mande uma mensagem para a
          gente!
        </p>
      </div>

      <div className="layout-contato">
        <section className="info-redes">
          <h3>Nossos Contatos</h3>

          <div className="lista-contatos">
            <a
              href="#whatsapp"
              onClick={(e) => e.preventDefault()}
              className="item-contato"
            >
              <div className="icone-social whatsapp" title="WhatsApp">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.126.556 4.122 1.527 5.853l-1.527 5.575 5.714-1.499c1.693.924 3.631 1.451 5.698 1.451 6.627 0 12-5.373 12-12 0-6.627-5.373-12-11.412-11.38z" />
                </svg>
              </div>
              <span>(11) 99999-9999</span>
            </a>

            <a
              href="#instagram"
              onClick={(e) => e.preventDefault()}
              className="item-contato"
            >
              <div className="icone-social instagram" title="Instagram">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span>@cantinaserraesoares</span>
            </a>

            <a
              href="#facebook"
              onClick={(e) => e.preventDefault()}
              className="item-contato"
            >
              <div className="icone-social facebook" title="Facebook">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <span>/cantinaserraesoares</span>
            </a>

            <a
              href="#email"
              onClick={(e) => e.preventDefault()}
              className="item-contato"
            >
              <div className="icone-social email" title="E-mail">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <span>contato@cantinaserraesoares.com.br</span>
            </a>
          </div>
        </section>

        <section className="area-formulario">
          <form className="form-contato" onSubmit={handleSubmit}>
            <div className="grupo-input">
              <label htmlFor="nome">Nome Completo</label>
              <input type="text" id="nome" placeholder="Digite seu nome" required />
            </div>

            <div className="grupo-input">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div className="grupo-input" ref={selectRef}>
              <label>Assunto</label>
              <div className="select-customizado">
                <button
                  type="button"
                  className={`select-gatilho ${selectAberto ? 'aberto' : ''} ${
                    erroAssunto ? 'erro-borda' : ''
                  }`}
                  onClick={() => setSelectAberto((prev) => !prev)}
                >
                  <span
                    className={
                      assuntoSelecionado ? 'texto-selecionado' : 'texto-placeholder'
                    }
                  >
                    {assuntoSelecionado
                      ? assuntoSelecionado.rotulo
                      : 'Selecione um assunto'}
                  </span>
                  <span className="seta-select">▼</span>
                </button>

                {selectAberto && (
                  <ul className="select-opcoes">
                    <li className="opcao-item desabilitada">Selecione um assunto</li>
                    {opcoesAssunto.map((op) => (
                      <li
                        key={op.valor}
                        className={`opcao-item ${
                          assuntoSelecionado?.valor === op.valor ? 'selecionada' : ''
                        }`}
                        onClick={() => {
                          setAssuntoSelecionado(op);
                          setErroAssunto(false);
                          setSelectAberto(false);
                        }}
                      >
                        {op.rotulo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grupo-input">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                rows="5"
                placeholder="Escreva sua mensagem aqui..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-enviar">
              Enviar Mensagem
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Contato;
