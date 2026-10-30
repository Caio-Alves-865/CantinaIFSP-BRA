import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login({ onLoginSucesso, onAlternarTema }) {
  const [abaAtiva, setAbaAtiva] = useState('tela-login'); // 'tela-login' | 'tela-cadastro' | 'tela-recuperacao'
  const [etapaRecuperacao, setEtapaRecuperacao] = useState('pedir-codigo'); // 'pedir-codigo' | 'nova-senha'
  const [erros, setErros] = useState({});
  const [toasts, setToasts] = useState([]);

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Campos de Cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');

  // Campos de Recuperação
  const [recEmail, setRecEmail] = useState('');
  const [recCodigo, setRecCodigo] = useState('');
  const [recNovaSenha, setRecNovaSenha] = useState('');

  const navigate = useNavigate();

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const mudarAba = (novaAba) => {
    setErros({});
    setAbaAtiva(novaAba);
    if (novaAba !== 'tela-recuperacao') {
      setEtapaRecuperacao('pedir-codigo');
    }
  };

  // Submissão do Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const email = loginEmail.trim();
    const senha = loginSenha.trim();

    if (!email) {
      novosErros.loginEmail = 'Por favor, preencha o seu e-mail.';
    }
    if (!senha) {
      novosErros.loginSenha = 'Por favor, digite a sua senha.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioSalvo = JSON.parse(localStorage.getItem('db_cantina_user'));

    if (!usuarioSalvo || usuarioSalvo.email !== email) {
      setErros({
        loginEmail: 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.',
      });
    } else if (usuarioSalvo.senha !== senha) {
      setErros({
        loginSenha: 'Senha incorreta. Tente novamente.',
      });
    } else {
      onLoginSucesso(usuarioSalvo.nome);
      navigate('/');
    }
  };

  // Submissão do Cadastro
  const handleCadastroSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const nome = cadNome.trim();
    const email = cadEmail.trim();
    const senha = cadSenha.trim();

    if (!nome) {
      novosErros.cadNome = 'Como devemos te chamar? Preencha seu nome.';
    }

    if (!email) {
      novosErros.cadEmail = 'Precisamos do seu e-mail para o cadastro.';
    } else if (!email.includes('@') || !email.includes('.')) {
      novosErros.cadEmail = 'Por favor, digite um formato de e-mail válido.';
    } else {
      const usuarioSalvo = JSON.parse(localStorage.getItem('db_cantina_user'));
      if (usuarioSalvo && usuarioSalvo.email === email) {
        novosErros.cadEmail =
          'Este e-mail já possui cadastro. Faça login ou recupere a senha.';
      }
    }

    if (!senha) {
      novosErros.cadSenha = 'Você precisa criar uma senha.';
    } else if (senha.length < 6) {
      novosErros.cadSenha = 'A senha é muito curta. Mínimo de 6 caracteres.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioBanco = { nome, email, senha };
    localStorage.setItem('db_cantina_user', JSON.stringify(usuarioBanco));

    mostrarToast('Cadastro realizado com sucesso! Faça seu login.', 'sucesso');
    setCadNome('');
    setCadEmail('');
    setCadSenha('');
    mudarAba('tela-login');
  };

  // Submissão de Pedir Código de Recuperação
  const handlePedirCodigoSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const email = recEmail.trim();

    if (!email) {
      novosErros.recEmail = 'Informe o seu e-mail para recuperar a senha.';
    } else if (!email.includes('@') || !email.includes('.')) {
      novosErros.recEmail = 'Formato de e-mail inválido.';
    } else {
      const usuarioSalvo = JSON.parse(localStorage.getItem('db_cantina_user'));
      if (!usuarioSalvo || usuarioSalvo.email !== email) {
        novosErros.recEmail = 'E-mail não encontrado no sistema.';
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setEtapaRecuperacao('nova-senha');
  };

  // Submissão da Nova Senha
  const handleNovaSenhaSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const codigo = recCodigo.trim();
    const novaSenha = recNovaSenha.trim();

    if (!codigo) {
      novosErros.recCodigo = 'Digite o código de validação recebido.';
    }
    if (!novaSenha) {
      novosErros.recNovaSenha = 'Crie uma nova senha.';
    } else if (novaSenha.length < 6) {
      novosErros.recNovaSenha = 'A nova senha deve ter no mínimo 6 caracteres.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioSalvo = JSON.parse(localStorage.getItem('db_cantina_user'));
    if (usuarioSalvo) {
      usuarioSalvo.senha = novaSenha;
      localStorage.setItem('db_cantina_user', JSON.stringify(usuarioSalvo));
    }

    mostrarToast('Senha redefinida com sucesso! Você já pode entrar.', 'sucesso');
    setRecEmail('');
    setRecCodigo('');
    setRecNovaSenha('');
    setEtapaRecuperacao('pedir-codigo');
    mudarAba('tela-login');
  };

  return (
    <div className="body-login">
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tipo}`}>
            <span className="indicador-toast"></span>
            <p style={{ margin: 0 }}>{toast.mensagem}</p>
          </div>
        ))}
      </div>

      <div className="controle-tema-login">
        <Link to="/" className="btn-voltar-home" title="Voltar para a página inicial">
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
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Voltar</span>
        </Link>

        <button
          id="btn-tema"
          type="button"
          className="btn-tema"
          title="Mudar Tema"
          onClick={onAlternarTema}
        >
          <svg
            className="icone-lua"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg
            className="icone-sol"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
      </div>

      <div className="container-login">
        <div className="logo-login">
          <img
            src="/img/logo_cantina_sem_fundo.png"
            alt="Logo Cantina Serra e Soares"
            style={{ width: '110px', height: 'auto', objectFit: 'contain' }}
          />
          <h1>Cantina Serra e Soares</h1>
        </div>

        <div className="box-autenticacao">
          <div className="abas-login">
            <button
              type="button"
              className={`aba-btn ${abaAtiva === 'tela-login' ? 'ativo' : ''}`}
              onClick={() => mudarAba('tela-login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`aba-btn ${abaAtiva === 'tela-cadastro' ? 'ativo' : ''}`}
              onClick={() => mudarAba('tela-cadastro')}
            >
              Cadastrar
            </button>
          </div>

          {/* Tela de Login */}
          <div
            id="tela-login"
            className={`tela-auth ${abaAtiva === 'tela-login' ? 'ativa' : ''}`}
          >
            <form id="form-login" noValidate onSubmit={handleLoginSubmit}>
              <div
                className={`grupo-input ${erros.loginEmail ? 'erro' : ''}`}
                id="grupo-login-email"
              >
                <label htmlFor="login-email">E-mail Institucional</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="@aluno.ifsp.edu.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <span className="mensagem-erro">{erros.loginEmail || ''}</span>
              </div>
              <div
                className={`grupo-input ${erros.loginSenha ? 'erro' : ''}`}
                id="grupo-login-senha"
              >
                <label htmlFor="login-senha">Senha</label>
                <input
                  type="password"
                  id="login-senha"
                  placeholder="••••••••"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  required
                />
                <span className="mensagem-erro">{erros.loginSenha || ''}</span>
              </div>
              <div className="opcoes-extras">
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    mudarAba('tela-recuperacao');
                  }}
                >
                  Esqueci minha senha
                </a>
              </div>
              <button type="submit" className="btn-principal">
                Entrar no Sistema
              </button>
            </form>
          </div>

          {/* Tela de Cadastro */}
          <div
            id="tela-cadastro"
            className={`tela-auth ${abaAtiva === 'tela-cadastro' ? 'ativa' : ''}`}
          >
            <form id="form-cadastro" noValidate onSubmit={handleCadastroSubmit}>
              <div
                className={`grupo-input ${erros.cadNome ? 'erro' : ''}`}
                id="grupo-cad-nome"
              >
                <label htmlFor="cad-nome">Nome Completo</label>
                <input
                  type="text"
                  id="cad-nome"
                  placeholder="Seu nome"
                  value={cadNome}
                  onChange={(e) => setCadNome(e.target.value)}
                  required
                />
                <span className="mensagem-erro">{erros.cadNome || ''}</span>
              </div>
              <div
                className={`grupo-input ${erros.cadEmail ? 'erro' : ''}`}
                id="grupo-cad-email"
              >
                <label htmlFor="cad-email">E-mail</label>
                <input
                  type="email"
                  id="cad-email"
                  placeholder="@aluno.ifsp.edu.br"
                  value={cadEmail}
                  onChange={(e) => setCadEmail(e.target.value)}
                  required
                />
                <span className="mensagem-erro">{erros.cadEmail || ''}</span>
              </div>
              <div
                className={`grupo-input ${erros.cadSenha ? 'erro' : ''}`}
                id="grupo-cad-senha"
              >
                <label htmlFor="cad-senha">Criar Senha</label>
                <input
                  type="password"
                  id="cad-senha"
                  placeholder="Mínimo 6 caracteres"
                  value={cadSenha}
                  onChange={(e) => setCadSenha(e.target.value)}
                  required
                />
                <span className="mensagem-erro">{erros.cadSenha || ''}</span>
              </div>
              <button type="submit" className="btn-principal">
                Criar Conta
              </button>
            </form>
          </div>

          {/* Tela de Recuperação de Senha */}
          <div
            id="tela-recuperacao"
            className={`tela-auth ${abaAtiva === 'tela-recuperacao' ? 'ativa' : ''}`}
          >
            <h4>Recuperar Senha</h4>
            <p className="texto-instrucao">
              Digite seu e-mail para receber o código de validação.
            </p>

            {etapaRecuperacao === 'pedir-codigo' ? (
              <form
                id="form-pedir-codigo"
                noValidate
                onSubmit={handlePedirCodigoSubmit}
              >
                <div
                  className={`grupo-input ${erros.recEmail ? 'erro' : ''}`}
                  id="grupo-rec-email"
                >
                  <label htmlFor="rec-email">E-mail</label>
                  <input
                    type="email"
                    id="rec-email"
                    placeholder="Seu e-mail cadastrado"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    required
                  />
                  <span className="mensagem-erro">{erros.recEmail || ''}</span>
                </div>
                <button type="submit" className="btn-principal">
                  Enviar Código
                </button>
                <button
                  type="button"
                  className="btn-voltar"
                  onClick={() => mudarAba('tela-login')}
                >
                  Voltar ao Login
                </button>
              </form>
            ) : (
              <form id="form-nova-senha" noValidate onSubmit={handleNovaSenhaSubmit}>
                <div className="mensagem-sucesso-email">
                  Código enviado! Verifique sua caixa de entrada.
                </div>

                <div
                  className={`grupo-input ${erros.recCodigo ? 'erro' : ''}`}
                  id="grupo-rec-codigo"
                >
                  <label htmlFor="rec-codigo">Código de Validação (Ex: 123456)</label>
                  <input
                    type="text"
                    id="rec-codigo"
                    placeholder="Digite o código"
                    value={recCodigo}
                    onChange={(e) => setRecCodigo(e.target.value)}
                    required
                  />
                  <span className="mensagem-erro">{erros.recCodigo || ''}</span>
                </div>
                <div
                  className={`grupo-input ${erros.recNovaSenha ? 'erro' : ''}`}
                  id="grupo-rec-nova-senha"
                >
                  <label htmlFor="rec-nova-senha">Nova Senha</label>
                  <input
                    type="password"
                    id="rec-nova-senha"
                    placeholder="••••••••"
                    value={recNovaSenha}
                    onChange={(e) => setRecNovaSenha(e.target.value)}
                    required
                  />
                  <span className="mensagem-erro">{erros.recNovaSenha || ''}</span>
                </div>
                <button type="submit" className="btn-principal">
                  Redefinir Senha
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
