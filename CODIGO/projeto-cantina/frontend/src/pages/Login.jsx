import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const DOMINIO_IFSP = 'aluno.ifsp.edu.br';
const CHAVE_LISTA_USUARIOS = 'db_cantina_users';
const CHAVE_USUARIO_LEGADO = 'db_cantina_user';
const CHAVE_COOLDOWN_REENVIO = 'cantina_cooldown_reenvio_ate';
const DURACAO_COOLDOWN_SEGUNDOS = 300; // 5 minutos (300 segundos)

// Gera sempre um novo código alfanumérico de 5 caracteres (A-Z, 0-9)
function gerarNovoCodigo5Caracteres() {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 5; i += 1) {
    const indice = Math.floor(Math.random() * alfabeto.length);
    codigo += alfabeto[indice];
  }
  return codigo;
}

// Formata segundos restantes no padrão MM:SS (ex: 05:00, 04:59)
function formatarTempoMMSS(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// Calcula quantos segundos faltam no contador de segurança salvo no localStorage
function obterSegundosRestantesCooldown() {
  const salvoAte = Number(localStorage.getItem(CHAVE_COOLDOWN_REENVIO) || 0);
  if (!salvoAte) return 0;
  const restante = Math.ceil((salvoAte - Date.now()) / 1000);
  return restante > 0 ? restante : 0;
}

// Obtém a lista completa de usuários cadastrados (migrando o registro único antigo se existir)
function obterListaUsuarios() {
  let lista = [];
  try {
    const brutoLista = localStorage.getItem(CHAVE_LISTA_USUARIOS);
    if (brutoLista) {
      const parseado = JSON.parse(brutoLista);
      if (Array.isArray(parseado)) {
        lista = parseado;
      }
    }
  } catch {
    lista = [];
  }

  try {
    const brutoLegado = localStorage.getItem(CHAVE_USUARIO_LEGADO);
    if (brutoLegado) {
      const usuarioLegado = JSON.parse(brutoLegado);
      if (
        usuarioLegado &&
        usuarioLegado.email &&
        !lista.some((u) => u.email.toLowerCase() === usuarioLegado.email.toLowerCase())
      ) {
        lista.push(usuarioLegado);
        localStorage.setItem(CHAVE_LISTA_USUARIOS, JSON.stringify(lista));
      }
    }
  } catch {
    // Ignora JSON inválido
  }

  return lista;
}

function buscarUsuarioPorEmail(email) {
  if (!email) return null;
  const emailNormalizado = email.trim().toLowerCase();
  const lista = obterListaUsuarios();
  return lista.find((u) => u.email.toLowerCase() === emailNormalizado) || null;
}

function salvarOuAtualizarUsuario(dadosUsuario) {
  const lista = obterListaUsuarios();
  const emailNormalizado = dadosUsuario.email.trim().toLowerCase();
  const indiceExistente = lista.findIndex(
    (u) => u.email.toLowerCase() === emailNormalizado
  );

  const registroFinal = {
    ...dadosUsuario,
    email: emailNormalizado,
  };

  if (indiceExistente >= 0) {
    lista[indiceExistente] = { ...lista[indiceExistente], ...registroFinal };
  } else {
    lista.push(registroFinal);
  }

  localStorage.setItem(CHAVE_LISTA_USUARIOS, JSON.stringify(lista));
  localStorage.setItem(CHAVE_USUARIO_LEGADO, JSON.stringify(registroFinal));
}

// Retorna o trecho restante de 'aluno.ifsp.edu.br' assim que o usuário digita '@'
function obterSufixoAutocomplete(valor) {
  if (!valor) return '';
  const indiceArroba = valor.indexOf('@');
  if (indiceArroba <= 0) return '';
  if (valor.indexOf('@', indiceArroba + 1) !== -1) return '';

  const digitadoAposArroba = valor.slice(indiceArroba + 1).toLowerCase();
  if (
    DOMINIO_IFSP.startsWith(digitadoAposArroba) &&
    digitadoAposArroba.length < DOMINIO_IFSP.length
  ) {
    return DOMINIO_IFSP.slice(digitadoAposArroba.length);
  }
  return '';
}

// Avalia a força da senha e retorna os critérios cumpridos/pendentes
function avaliarForcaSenha(senha) {
  const temEspaco = /\s/.test(senha);
  const temMinimo8 = senha.length >= 8 && !temEspaco;
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temSimbolo = /[^a-zA-Z0-9\s]/.test(senha);

  const regras = [
    { id: 'min8', texto: 'Mínimo de 8 caracteres', cumprida: temMinimo8 },
    { id: 'letra', texto: 'Conter letras (a-z)', cumprida: temLetra },
    { id: 'numero', texto: 'Conter números (0-9)', cumprida: temNumero },
    { id: 'simbolo', texto: 'Conter símbolo (!@#$...)', cumprida: temSimbolo },
  ];

  const totalCumpridas = [temMinimo8, temLetra, temNumero, temSimbolo].filter(Boolean).length;

  let nivel = 1; // 1 = Fraca, 2 = Média, 3 = Forte
  let rotulo = 'Fraca';
  let classeCor = 'fraca';

  if (!temEspaco && temMinimo8 && totalCumpridas === 4) {
    nivel = 3;
    rotulo = 'Forte';
    classeCor = 'forte';
  } else if (!temEspaco && temMinimo8 && totalCumpridas === 3) {
    nivel = 2;
    rotulo = 'Média';
    classeCor = 'media';
  }

  return { nivel, rotulo, classeCor, regras, validaParaCadastro: !temEspaco && nivel >= 2 };
}

function validarEmailInstitucional(email) {
  const limpo = email.trim().toLowerCase();
  const partes = limpo.split('@');
  return partes.length === 2 && partes[0].length > 0 && limpo.endsWith('@aluno.ifsp.edu.br');
}

function CampoEmailInstitucional({ id, valor, onChange, placeholder }) {
  const sufixoSugerido = obterSufixoAutocomplete(valor);

  const aplicarAutocomplete = () => {
    if (sufixoSugerido) {
      onChange(valor + sufixoSugerido);
    }
  };

  const handleKeyDown = (e) => {
    if (
      sufixoSugerido &&
      (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowRight')
    ) {
      e.preventDefault();
      aplicarAutocomplete();
    }
  };

  return (
    <div className="wrapper-email-autocomplete">
      {sufixoSugerido && (
        <div className="camada-fantasma-email" aria-hidden="true">
          <span className="texto-fantasma-invisivel">{valor}</span>
          <span className="texto-fantasma-sugestao">{sufixoSugerido}</span>
        </div>
      )}
      <input
        type="email"
        id={id}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={aplicarAutocomplete}
        autoComplete="off"
        required
      />
    </div>
  );
}

// Componente de 5 bloquinhos separados (A-Z e 0-9, maiúsculas automáticas e suporte a Ctrl+V)
function InputCodigoCincoBlocos({ valores, onChange, temErro, autoFocusPrimeiro = false }) {
  const inputsRef = useRef([]);

  const focarBloco = (indice) => {
    if (indice >= 0 && indice < 5 && inputsRef.current[indice]) {
      inputsRef.current[indice].focus();
      inputsRef.current[indice].select();
    }
  };

  const handleChange = (indice, evento) => {
    const bruto = evento.target.value;
    // Filtra apenas letras e números e converte para MAIÚSCULAS automaticamente
    const limpo = bruto.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!limpo) {
      const novos = [...valores];
      novos[indice] = '';
      onChange(novos);
      return;
    }

    // Se o usuário digitou ou colou mais de 1 caractere no mesmo input
    if (limpo.length > 1) {
      const novos = [...valores];
      let proximoFoco = indice;
      for (let i = 0; i < limpo.length && indice + i < 5; i += 1) {
        novos[indice + i] = limpo[i];
        proximoFoco = indice + i;
      }
      onChange(novos);
      focarBloco(Math.min(proximoFoco + 1, 4));
      return;
    }

    const novos = [...valores];
    novos[indice] = limpo[0];
    onChange(novos);

    if (indice < 4) {
      focarBloco(indice + 1);
    }
  };

  const handleKeyDown = (indice, evento) => {
    if (evento.key === 'Backspace') {
      if (valores[indice]) {
        const novos = [...valores];
        novos[indice] = '';
        onChange(novos);
      } else if (indice > 0) {
        evento.preventDefault();
        const novos = [...valores];
        novos[indice - 1] = '';
        onChange(novos);
        focarBloco(indice - 1);
      }
    } else if (evento.key === 'ArrowLeft' && indice > 0) {
      evento.preventDefault();
      focarBloco(indice - 1);
    } else if (evento.key === 'ArrowRight' && indice < 4) {
      evento.preventDefault();
      focarBloco(indice + 1);
    }
  };

  const handlePaste = (indice, evento) => {
    evento.preventDefault();
    const textoColado = (evento.clipboardData || window.clipboardData).getData('text');
    const limpo = textoColado.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!limpo) return;

    const novos = [...valores];
    let ultimoPreenchido = indice;
    for (let i = 0; i < limpo.length && indice + i < 5; i += 1) {
      novos[indice + i] = limpo[i];
      ultimoPreenchido = indice + i;
    }
    onChange(novos);
    focarBloco(Math.min(ultimoPreenchido + 1, 4));
  };

  return (
    <div className={`container-cinco-blocos ${temErro ? 'erro' : ''}`}>
      {[0, 1, 2, 3, 4].map((indice) => (
        <input
          key={indice}
          ref={(el) => {
            inputsRef.current[indice] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={2}
          autoFocus={autoFocusPrimeiro && indice === 0}
          className={`bloco-codigo-token ${valores[indice] ? 'preenchido' : ''}`}
          value={valores[indice] || ''}
          onChange={(e) => handleChange(indice, e)}
          onKeyDown={(e) => handleKeyDown(indice, e)}
          onPaste={(e) => handlePaste(indice, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Caractere ${indice + 1} do código de verificação`}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

// Componente reutilizável da Barra de Força da Senha + Nome Abaixo + Balão de Regras
function MedidorForcaSenha({ senha, avaliacao, mostrarBalao, onToggleBalao }) {
  const temTexto = senha.length > 0;

  return (
    <div
      className={`container-forca-senha ${temTexto ? 'visivel' : 'oculto'}`}
      onClick={(e) => {
        if (!temTexto) return;
        e.stopPropagation();
        onToggleBalao();
      }}
      role="button"
      tabIndex={temTexto ? 0 : -1}
      title="Clique para ver os requisitos da senha"
      onKeyDown={(e) => {
        if (temTexto && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onToggleBalao();
        }
      }}
    >
      <div className="barras-forca-senha">
        <span className={`segmento-forca ativo ${avaliacao.classeCor}`} />
        <span
          className={`segmento-forca ${
            avaliacao.nivel >= 2 ? `ativo ${avaliacao.classeCor}` : ''
          }`}
        />
        <span
          className={`segmento-forca ${
            avaliacao.nivel >= 3 ? `ativo ${avaliacao.classeCor}` : ''
          }`}
        />
      </div>
      <span className={`rotulo-forca-senha ${avaliacao.classeCor}`}>
        Senha {avaliacao.rotulo}
      </span>

      {/* Balão flutuante com as regras cumpridas (verde) e pendentes (vermelho) */}
      {mostrarBalao && temTexto && (
        <div
          className="balao-regras-senha"
          role="status"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="lista-regras-senha">
            {avaliacao.regras.map((regra) => (
              <li
                key={regra.id}
                className={regra.cumprida ? 'cumprida' : 'pendente'}
              >
                <span className="icone-regra-senha">
                  {regra.cumprida ? '✓' : '✕'}
                </span>
                <span>{regra.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Campo de Senha com botão de olho customizado (bloqueia 100% de espaços ao digitar e colar)
function CampoSenhaComOlho({ id, placeholder, valor, onChange, onKeyDown }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const temTexto = valor.length > 0;

  const handleKeyDownInterno = (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      return;
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleChangeInterno = (e) => {
    const semEspaco = e.target.value.replace(/\s+/g, '');
    e.target.value = semEspaco;
    onChange(e);
  };

  const handlePasteInterno = (e) => {
    const textoColado = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    if (textoColado.includes(' ')) {
      e.preventDefault();
      const semEspaco = textoColado.replace(/\s+/g, '');
      const input = e.target;
      const start = input.selectionStart ?? valor.length;
      const end = input.selectionEnd ?? valor.length;
      const novoValor = valor.slice(0, start) + semEspaco + valor.slice(end);
      e.target.value = novoValor;
      onChange(e);
    }
  };

  return (
    <div className="wrapper-input-senha">
      <input
        type={mostrarSenha ? 'text' : 'password'}
        id={id}
        placeholder={placeholder}
        value={valor}
        onChange={handleChangeInterno}
        onKeyDown={handleKeyDownInterno}
        onPaste={handlePasteInterno}
        autoComplete="new-password"
        required
      />
      {temTexto && (
        <button
          type="button"
          className="btn-olho-senha"
          onClick={() => setMostrarSenha((prev) => !prev)}
          tabIndex={-1}
          aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {mostrarSenha ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="m1 1 22 22" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

function Login({ onLoginSucesso, onAlternarTema }) {
  const [abaAtiva, setAbaAtiva] = useState('tela-login'); // 'tela-login' | 'tela-cadastro' | 'tela-recuperacao'
  const [etapaRecuperacao, setEtapaRecuperacao] = useState('pedir-codigo'); // 'pedir-codigo' | 'nova-senha'
  const [erros, setErros] = useState({});
  const [toasts, setToasts] = useState([]);
  const [mostrarBalaoRegras, setMostrarBalaoRegras] = useState(false);
  const [mostrarBalaoRegrasRec, setMostrarBalaoRegrasRec] = useState(false);

  // Contador global de segurança (5 minutos = 300s) persistido no localStorage
  const [segundosCooldownReenvio, setSegundosCooldownReenvio] = useState(() =>
    obterSegundosRestantesCooldown()
  );

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Campos de Cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');

  // Modal de Verificação de E-mail (Token de 5 caracteres)
  const [modalVerificacaoAberto, setModalVerificacaoAberto] = useState(false);
  const [dadosPendentesCadastro, setDadosPendentesCadastro] = useState(null);
  const [blocosTokenCadastro, setBlocosTokenCadastro] = useState(['', '', '', '', '']);
  const [erroTokenCadastro, setErroTokenCadastro] = useState('');
  const [tokenAtivoSessao, setTokenAtivoSessao] = useState('');

  // Campos de Recuperação
  const [recEmail, setRecEmail] = useState('');
  const [recBlocosCodigo, setRecBlocosCodigo] = useState(['', '', '', '', '']);
  const [recNovaSenha, setRecNovaSenha] = useState('');

  const navigate = useNavigate();
  const avaliacaoSenha = avaliarForcaSenha(cadSenha);
  const avaliacaoSenhaRec = avaliarForcaSenha(recNovaSenha);

  // Atualiza a cada 1 segundo o contador de reenvio (persiste mesmo mudando de aba, e-mail ou recarregando)
  useEffect(() => {
    const intervalo = setInterval(() => {
      const restante = obterSegundosRestantesCooldown();
      setSegundosCooldownReenvio(restante);
      if (restante === 0 && localStorage.getItem(CHAVE_COOLDOWN_REENVIO)) {
        localStorage.removeItem(CHAVE_COOLDOWN_REENVIO);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const iniciarCooldownCincoMinutos = () => {
    const expiraEm = Date.now() + DURACAO_COOLDOWN_SEGUNDOS * 1000;
    localStorage.setItem(CHAVE_COOLDOWN_REENVIO, String(expiraEm));
    setSegundosCooldownReenvio(DURACAO_COOLDOWN_SEGUNDOS);
  };

  const dispararGeracaoNovoToken = (emailDestino) => {
    const novoToken = gerarNovoCodigo5Caracteres();
    setTokenAtivoSessao(novoToken);

    if (emailDestino) {
      fetch('http://localhost:5000/api/enviar-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailDestino }),
      }).catch(() => {});
    }
    return novoToken;
  };

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const mudarAba = (novaAba) => {
    setErros({});
    setMostrarBalaoRegras(false);
    setMostrarBalaoRegrasRec(false);
    setAbaAtiva(novaAba);
    if (novaAba !== 'tela-recuperacao') {
      setEtapaRecuperacao('pedir-codigo');
    }
  };

  // Submissão do Login (busca na lista completa de usuários sem sobrescrever cadastros anteriores)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const sufixo = obterSufixoAutocomplete(loginEmail);
    const email = (sufixo ? loginEmail + sufixo : loginEmail).trim().toLowerCase();
    if (sufixo) setLoginEmail(email);

    const senha = loginSenha;

    if (!email) {
      novosErros.loginEmail = 'Por favor, preencha o seu e-mail.';
    } else if (!validarEmailInstitucional(email)) {
      novosErros.loginEmail = 'Use seu e-mail institucional.';
    }

    if (!senha) {
      novosErros.loginSenha = 'Por favor, digite a sua senha.';
    } else if (/\s/.test(senha)) {
      novosErros.loginSenha = 'A senha não pode conter espaços.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioEncontrado = buscarUsuarioPorEmail(email);

    if (!usuarioEncontrado) {
      setErros({
        loginEmail: 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.',
      });
    } else if (usuarioEncontrado.senha !== senha) {
      setErros({
        loginSenha: 'Senha incorreta. Tente novamente.',
      });
    } else {
      localStorage.setItem(CHAVE_USUARIO_LEGADO, JSON.stringify(usuarioEncontrado));
      onLoginSucesso(usuarioEncontrado.nome);
      navigate('/');
    }
  };

  // Submissão do Cadastro
  const handleCadastroSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const nome = cadNome.trim();
    const sufixo = obterSufixoAutocomplete(cadEmail);
    const email = (sufixo ? cadEmail + sufixo : cadEmail).trim().toLowerCase();
    if (sufixo) setCadEmail(email);

    const senha = cadSenha;

    if (!nome) {
      novosErros.cadNome = 'Como devemos te chamar? Preencha seu nome.';
    }

    if (!email) {
      novosErros.cadEmail = 'Use seu e-mail institucional.';
    } else if (!validarEmailInstitucional(email)) {
      novosErros.cadEmail = 'Use seu e-mail institucional.';
    } else {
      const usuarioExistente = buscarUsuarioPorEmail(email);
      if (usuarioExistente) {
        novosErros.cadEmail =
          'Este e-mail já possui cadastro. Faça login ou recupere a senha.';
      }
    }

    if (!senha) {
      novosErros.cadSenha = 'Você precisa criar uma senha.';
    } else if (/\s/.test(senha)) {
      novosErros.cadSenha = 'A senha não pode conter espaços.';
    } else if (!avaliacaoSenha.validaParaCadastro) {
      novosErros.cadSenha =
        'A senha precisa ser pelo menos Média (toque na barra para ver as regras).';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    // Gera um novo token de 5 caracteres na sessão e na API Flask
    dispararGeracaoNovoToken(email);

    setDadosPendentesCadastro({ nome, email, senha });
    setBlocosTokenCadastro(['', '', '', '', '']);
    setErroTokenCadastro('');
    setMostrarBalaoRegras(false);
    setModalVerificacaoAberto(true);
  };

  // Confirmação dos 5 bloquinhos do Token de Cadastro
  const handleConfirmarTokenCadastro = (e) => {
    e.preventDefault();
    const codigoCompleto = blocosTokenCadastro.join('').toUpperCase();

    if (codigoCompleto.length < 5 || !/^[A-Z0-9]{5}$/.test(codigoCompleto)) {
      setErroTokenCadastro('Preencha os 5 caracteres do código enviado ao seu e-mail.');
      return;
    }

    if (!dadosPendentesCadastro) return;
    const { nome, email, senha } = dadosPendentesCadastro;

    // Envia validação e cadastro para a API Flask em segundo plano
    fetch('http://localhost:5000/api/verificar-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo: codigoCompleto }),
    }).catch(() => {});

    fetch('http://localhost:5000/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, codigo: codigoCompleto }),
    }).catch(() => {});

    // Salva na lista completa de usuários e autentica imediatamente na sessão atual
    const novoUsuario = {
      nome,
      email,
      senha,
      emailVerificado: true,
      ultimoTokenUsado: codigoCompleto || tokenAtivoSessao,
    };
    salvarOuAtualizarUsuario(novoUsuario);
    localStorage.setItem(CHAVE_USUARIO_LEGADO, JSON.stringify(novoUsuario));

    setModalVerificacaoAberto(false);
    setDadosPendentesCadastro(null);
    setBlocosTokenCadastro(['', '', '', '', '']);
    setErroTokenCadastro('');
    setCadNome('');
    setCadEmail('');
    setCadSenha('');
    onLoginSucesso(nome);
    navigate('/');
  };

  // Reenvia um NOVO código de 5 caracteres e ativa a trava de 5 minutos
  const handleReenviarToken = (emailAlvo, limparBlocos) => {
    if (segundosCooldownReenvio > 0) return;

    dispararGeracaoNovoToken(emailAlvo);
    limparBlocos();
    iniciarCooldownCincoMinutos();
    mostrarToast(
      'Novo código de 5 caracteres gerado e enviado! Aguarde 5 min para novo reenvio.',
      'sucesso'
    );
  };

  // Submissão de Pedir Código de Recuperação
  const handlePedirCodigoSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const sufixo = obterSufixoAutocomplete(recEmail);
    const email = (sufixo ? recEmail + sufixo : recEmail).trim().toLowerCase();
    if (sufixo) setRecEmail(email);

    if (!email || !validarEmailInstitucional(email)) {
      novosErros.recEmail = 'Use seu e-mail institucional.';
    } else {
      const usuarioEncontrado = buscarUsuarioPorEmail(email);
      if (!usuarioEncontrado) {
        novosErros.recEmail = 'E-mail não encontrado no sistema.';
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    dispararGeracaoNovoToken(email);
    setErros({});
    setRecBlocosCodigo(['', '', '', '', '']);
    setMostrarBalaoRegrasRec(false);
    setEtapaRecuperacao('nova-senha');
  };

  // Submissão da Nova Senha
  const handleNovaSenhaSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};
    const codigo = recBlocosCodigo.join('').toUpperCase();
    const novaSenha = recNovaSenha;

    if (codigo.length < 5 || !/^[A-Z0-9]{5}$/.test(codigo)) {
      novosErros.recCodigo = 'Preencha os 5 caracteres do código de validação.';
    }
    if (!novaSenha) {
      novosErros.recNovaSenha = 'Crie uma nova senha.';
    } else if (/\s/.test(novaSenha)) {
      novosErros.recNovaSenha = 'A nova senha não pode conter espaços.';
    } else if (!avaliacaoSenhaRec.validaParaCadastro) {
      novosErros.recNovaSenha =
        'A nova senha precisa ser pelo menos Média (toque na barra para ver as regras).';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioExistente = buscarUsuarioPorEmail(recEmail);
    if (usuarioExistente) {
      salvarOuAtualizarUsuario({
        ...usuarioExistente,
        senha: novaSenha,
      });
    }

    mostrarToast('Senha redefinida com sucesso! Você já pode entrar.', 'sucesso');
    setRecEmail('');
    setRecBlocosCodigo(['', '', '', '', '']);
    setRecNovaSenha('');
    setMostrarBalaoRegrasRec(false);
    setEtapaRecuperacao('pedir-codigo');
    mudarAba('tela-login');
  };

  return (
    <div
      className="body-login"
      onClick={() => {
        setMostrarBalaoRegras(false);
        setMostrarBalaoRegrasRec(false);
      }}
    >
      {/* Decoração Botânica Minimalista inspirada nas folhinhas da Logo */}
      <div className="fundo-folhas-login" aria-hidden="true">
        <svg className="folha-decorativa folha-1" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
          <circle cx="35" cy="30" r="3" fill="currentColor" />
          <circle cx="95" cy="80" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-2" viewBox="0 0 120 120" fill="none">
          <path
            d="M15 95 C25 40, 65 20, 105 25 C90 65, 65 95, 15 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M15 95 Q55 62 96 30" stroke="currentColor" strokeWidth="2" />
          <path
            d="M55 20 C70 5, 95 5, 110 15 C95 30, 70 30, 55 20 Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="28" cy="45" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-3" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
          <circle cx="85" cy="90" r="3.5" fill="currentColor" />
          <circle cx="45" cy="22" r="2" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-4" viewBox="0 0 120 120" fill="none">
          <path
            d="M25 95 C25 45, 65 22, 100 20 C95 58, 70 92, 25 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M25 95 Q60 60 92 26" stroke="currentColor" strokeWidth="2" />
          <circle cx="88" cy="75" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-5" viewBox="0 0 120 120" fill="none">
          <path
            d="M18 98 C22 48, 62 24, 102 18 C96 58, 72 92, 18 98 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M18 98 Q58 60 94 24" stroke="currentColor" strokeWidth="2" />
          <path
            d="M18 65 C5 45, 12 22, 32 14 C38 35, 32 55, 18 65 Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="65" cy="95" r="3" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-6" viewBox="0 0 120 120" fill="none">
          <path
            d="M22 96 C24 46, 64 22, 102 20 C96 58, 72 92, 22 96 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M22 96 Q60 58 94 26" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="28" r="3" fill="currentColor" />
          <circle cx="92" cy="78" r="2" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-7" viewBox="0 0 120 120" fill="none">
          <path
            d="M15 95 C25 40, 65 20, 105 25 C90 65, 65 95, 15 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M15 95 Q55 62 96 30" stroke="currentColor" strokeWidth="2" />
          <path
            d="M55 20 C70 5, 95 5, 110 15 C95 30, 70 30, 55 20 Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="40" cy="88" r="2.5" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-8" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 100 C20 45, 65 20, 105 15 C100 55, 75 95, 20 100 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M20 100 Q60 60 95 22" stroke="currentColor" strokeWidth="2" />
          <circle cx="35" cy="30" r="3" fill="currentColor" />
        </svg>

        <svg className="folha-decorativa folha-9" viewBox="0 0 120 120" fill="none">
          <path
            d="M18 98 C22 48, 62 24, 102 18 C96 58, 72 92, 18 98 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M18 98 Q58 60 94 24" stroke="currentColor" strokeWidth="2" />
          <path
            d="M18 65 C5 45, 12 22, 32 14 C38 35, 32 55, 18 65 Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <svg className="folha-decorativa folha-10" viewBox="0 0 120 120" fill="none">
          <path
            d="M25 95 C25 45, 65 22, 100 20 C95 58, 70 92, 25 95 Z"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M25 95 Q60 60 92 26" stroke="currentColor" strokeWidth="2" />
          <circle cx="38" cy="25" r="2.5" fill="currentColor" />
          <circle cx="88" cy="75" r="3" fill="currentColor" />
        </svg>
      </div>

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
            src="/img/logos/logo_cantina_sem_fundo.png"
            alt="Logo Cantina Serra e Soares"
            className="img-logo-pagina-login"
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
                <CampoEmailInstitucional
                  id="login-email"
                  placeholder="nome@aluno.ifsp.edu.br"
                  valor={loginEmail}
                  onChange={(novoValor) => {
                    setLoginEmail(novoValor);
                    if (erros.loginEmail) {
                      setErros((prev) => ({ ...prev, loginEmail: '' }));
                    }
                  }}
                />
                <span className="mensagem-erro">{erros.loginEmail || ''}</span>
              </div>
              <div
                className={`grupo-input ${erros.loginSenha ? 'erro' : ''}`}
                id="grupo-login-senha"
              >
                <label htmlFor="login-senha">Senha</label>
                <CampoSenhaComOlho
                  id="login-senha"
                  placeholder="••••••••"
                  valor={loginSenha}
                  onChange={(e) => {
                    setLoginSenha(e.target.value.replace(/\s+/g, ''));
                    if (erros.loginSenha) {
                      setErros((prev) => ({ ...prev, loginSenha: '' }));
                    }
                  }}
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
            <form
              id="form-cadastro"
              noValidate
              autoComplete="off"
              onSubmit={handleCadastroSubmit}
            >
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
                  onChange={(e) => {
                    setCadNome(e.target.value);
                    if (erros.cadNome) {
                      setErros((prev) => ({ ...prev, cadNome: '' }));
                    }
                  }}
                  autoComplete="off"
                  required
                />
                <span className="mensagem-erro">{erros.cadNome || ''}</span>
              </div>
              <div
                className={`grupo-input ${erros.cadEmail ? 'erro' : ''}`}
                id="grupo-cad-email"
              >
                <label htmlFor="cad-email">E-mail Institucional</label>
                <CampoEmailInstitucional
                  id="cad-email"
                  placeholder="nome@aluno.ifsp.edu.br"
                  valor={cadEmail}
                  onChange={(novoValor) => {
                    setCadEmail(novoValor);
                    if (erros.cadEmail) {
                      setErros((prev) => ({ ...prev, cadEmail: '' }));
                    }
                  }}
                />
                <span className="mensagem-erro">{erros.cadEmail || ''}</span>
              </div>
              <div
                className={`grupo-input grupo-senha-cadastro ${
                  erros.cadSenha ? 'erro' : ''
                }`}
                id="grupo-cad-senha"
              >
                <label htmlFor="cad-senha">Criar Senha</label>
                <CampoSenhaComOlho
                  id="cad-senha"
                  placeholder="Mínimo de 8 caracteres"
                  valor={cadSenha}
                  onChange={(e) => {
                    setCadSenha(e.target.value.replace(/\s+/g, ''));
                    if (erros.cadSenha) {
                      setErros((prev) => ({ ...prev, cadSenha: '' }));
                    }
                  }}
                />

                {/* Medidor Centralizado de Força da Senha (sem alterar a altura do card) */}
                <MedidorForcaSenha
                  senha={cadSenha}
                  avaliacao={avaliacaoSenha}
                  mostrarBalao={mostrarBalaoRegras}
                  onToggleBalao={() => setMostrarBalaoRegras((prev) => !prev)}
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
            {etapaRecuperacao === 'pedir-codigo' && (
              <p className="texto-instrucao">
                Digite seu e-mail para receber o código de validação.
              </p>
            )}

            {etapaRecuperacao === 'pedir-codigo' ? (
              <form
                id="form-pedir-codigo"
                noValidate
                autoComplete="off"
                onSubmit={handlePedirCodigoSubmit}
              >
                <div
                  className={`grupo-input ${erros.recEmail ? 'erro' : ''}`}
                  id="grupo-rec-email"
                >
                  <label htmlFor="rec-email">E-mail Institucional</label>
                  <CampoEmailInstitucional
                    id="rec-email"
                    placeholder="nome@aluno.ifsp.edu.br"
                    valor={recEmail}
                    onChange={(novoValor) => {
                      setRecEmail(novoValor);
                      if (erros.recEmail) {
                        setErros((prev) => ({ ...prev, recEmail: '' }));
                      }
                    }}
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
              <form
                id="form-nova-senha"
                className="form-nova-senha-compacto"
                noValidate
                autoComplete="off"
                onSubmit={handleNovaSenhaSubmit}
              >
                <p className="descricao-modal-token subtitulo-codigo-rec">
                  Enviamos um código de <strong>5 caracteres</strong> para
                  <span className="email-destaque-token">{recEmail}</span>
                </p>

                <div
                  className={`grupo-input grupo-codigo-rec ${
                    erros.recCodigo ? 'erro' : ''
                  }`}
                  id="grupo-rec-codigo"
                >
                  <InputCodigoCincoBlocos
                    valores={recBlocosCodigo}
                    temErro={Boolean(erros.recCodigo)}
                    onChange={(novosBlocos) => {
                      setRecBlocosCodigo(novosBlocos);
                      if (erros.recCodigo) {
                        setErros((prev) => ({ ...prev, recCodigo: '' }));
                      }
                    }}
                  />
                  <span className="mensagem-erro">{erros.recCodigo || ''}</span>
                </div>
                <div
                  className={`grupo-input grupo-senha-cadastro ${
                    erros.recNovaSenha ? 'erro' : ''
                  }`}
                  id="grupo-rec-nova-senha"
                >
                  <label htmlFor="rec-nova-senha">Nova Senha</label>
                  <CampoSenhaComOlho
                    id="rec-nova-senha"
                    placeholder="Mínimo de 8 caracteres"
                    valor={recNovaSenha}
                    onChange={(e) => {
                      setRecNovaSenha(e.target.value.replace(/\s+/g, ''));
                      if (erros.recNovaSenha) {
                        setErros((prev) => ({ ...prev, recNovaSenha: '' }));
                      }
                    }}
                  />

                  {/* Mesmo Medidor Centralizado de Força da Senha do Cadastro */}
                  <MedidorForcaSenha
                    senha={recNovaSenha}
                    avaliacao={avaliacaoSenhaRec}
                    mostrarBalao={mostrarBalaoRegrasRec}
                    onToggleBalao={() => setMostrarBalaoRegrasRec((prev) => !prev)}
                  />

                  <span className="mensagem-erro">{erros.recNovaSenha || ''}</span>
                </div>
                <button type="submit" className="btn-principal">
                  Redefinir Senha
                </button>

                <div className="acoes-rodape-token acoes-rodape-recuperacao">
                  <button
                    type="button"
                    className="btn-link-token"
                    disabled={segundosCooldownReenvio > 0}
                    onClick={() =>
                      handleReenviarToken(recEmail, () => {
                        setRecBlocosCodigo(['', '', '', '', '']);
                        setErros((prev) => ({ ...prev, recCodigo: '' }));
                      })
                    }
                  >
                    {segundosCooldownReenvio > 0
                      ? `Reenviar código (${formatarTempoMMSS(segundosCooldownReenvio)})`
                      : 'Reenviar código'}
                  </button>
                  <span className="divisor-acoes-token">•</span>
                  <button
                    type="button"
                    className="btn-link-token"
                    onClick={() => {
                      setErros({});
                      setMostrarBalaoRegrasRec(false);
                      setEtapaRecuperacao('pedir-codigo');
                    }}
                  >
                    Alterar e-mail
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Verificação do E-mail Institucional (5 Bloquinhos A-Z / 0-9) */}
      {modalVerificacaoAberto && (
        <div
          className="overlay-modal-token"
          onClick={() => setModalVerificacaoAberto(false)}
        >
          <div
            className="card-modal-token"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-token"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="icone-modal-token" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h3 id="titulo-modal-token">Verifique seu E-mail</h3>
            <p className="descricao-modal-token">
              Enviamos um código de <strong>5 caracteres</strong> para
              <span className="email-destaque-token">
                {dadosPendentesCadastro?.email}
              </span>
            </p>

            <form onSubmit={handleConfirmarTokenCadastro} noValidate>
              <InputCodigoCincoBlocos
                valores={blocosTokenCadastro}
                temErro={Boolean(erroTokenCadastro)}
                autoFocusPrimeiro
                onChange={(novosBlocos) => {
                  setBlocosTokenCadastro(novosBlocos);
                  if (erroTokenCadastro) setErroTokenCadastro('');
                }}
              />

              {erroTokenCadastro && (
                <span className="erro-modal-token">{erroTokenCadastro}</span>
              )}

              <button type="submit" className="btn-principal btn-confirmar-token">
                Confirmar Código
              </button>
            </form>

            <div className="acoes-rodape-token">
              <button
                type="button"
                className="btn-link-token"
                disabled={segundosCooldownReenvio > 0}
                onClick={() =>
                  handleReenviarToken(dadosPendentesCadastro?.email, () => {
                    setBlocosTokenCadastro(['', '', '', '', '']);
                    setErroTokenCadastro('');
                  })
                }
              >
                {segundosCooldownReenvio > 0
                  ? `Reenviar código (${formatarTempoMMSS(segundosCooldownReenvio)})`
                  : 'Reenviar código'}
              </button>
              <span className="divisor-acoes-token">•</span>
              <button
                type="button"
                className="btn-link-token"
                onClick={() => setModalVerificacaoAberto(false)}
              >
                Alterar e-mail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
