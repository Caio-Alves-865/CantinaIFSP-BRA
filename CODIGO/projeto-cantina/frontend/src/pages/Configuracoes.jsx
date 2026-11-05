import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  obterPerfilUsuarioAtual,
  salvarPerfilUsuarioAtual,
  aplicarAcessibilidadeNoDOM,
} from '../utils/usuarioStorage';
import DatePickerCustomizado, {
  formatarIsoParaBr,
  formatarBrParaIso,
  validarDataBr,
  formatarDataPorExtenso,
} from '../components/DatePickerCustomizado';
import '../styles/configuracoes.css';

const LISTA_ALERGIAS = [
  {
    id: 'Glúten',
    titulo: 'Glúten',
    descricao: 'Pães, massas com trigo, farinha de rosca e empanados.',
  },
  {
    id: 'Leite / Lactose',
    titulo: 'Leite / Lactose',
    descricao: 'Queijos, requeijão, manteiga, leite condensado e sorvetes.',
  },
  {
    id: 'Ovo',
    titulo: 'Ovo',
    descricao: 'Massas artesanais, pães de queijo e preparos com ovos.',
  },
  {
    id: 'Gergelim',
    titulo: 'Gergelim',
    descricao: 'Pães de hambúrguer com gergelim e sementes.',
  },
  {
    id: 'Amendoim / Oleaginosas',
    titulo: 'Amendoim / Oleaginosas',
    descricao: 'Amendoim, castanhas, nozes e derivados.',
  },
  {
    id: 'Frutos do Mar',
    titulo: 'Frutos do Mar',
    descricao: 'Peixes, camarão e frutos do mar em geral.',
  },
];

// Estados possíveis da pílula de alergia (switch de 3 posições)
const ESTADOS_ALERGIA = [
  { id: 'nao', rotulo: 'Não tenho' },
  { id: 'padrao', rotulo: 'Padrão' },
  { id: 'tenho', rotulo: 'Tenho alergia' },
];

const DESCRICAO_ESTADO_ALERGIA = {
  nao: 'O aviso deste ingrediente não aparecerá para você.',
  padrao: '',
  tenho: 'Alerta reforçado sempre que um produto contiver este ingrediente.',
};

const METODOS_PAGAMENTO = [
  {
    id: 'pix',
    titulo: 'PIX (Aprovação na hora)',
    descricao: 'Gera QR Code e código Copia e Cola instantaneamente.',
  },
  {
    id: 'cartao',
    titulo: 'Cartão de Crédito / Débito',
    descricao: 'Pagamento rápido na maquininha ao retirar no balcão.',
  },
  {
    id: 'balcao',
    titulo: 'Pagar na Retirada (Dinheiro)',
    descricao: 'Acerto direto no caixa da cantina na hora de retirar.',
  },
];

const OPCOES_FONTE = [
  { id: 'normal', rotulo: 'Padrão', tamanhoPx: '13px' },
  { id: 'medio', rotulo: 'Médio', tamanhoPx: '15px' },
  { id: 'grande', rotulo: 'Grande', tamanhoPx: '17px' },
];

const TIPOS_DALTONISMO = [
  {
    id: 'protanopia',
    titulo: 'Protanopia',
    descricao: 'Dificuldade com tons de vermelho.',
  },
  {
    id: 'deuteranopia',
    titulo: 'Deuteranopia',
    descricao: 'Dificuldade com tons de verde.',
  },
  {
    id: 'tritanopia',
    titulo: 'Tritanopia',
    descricao: 'Dificuldade com azul e amarelo.',
  },
  {
    id: 'acromatopsia',
    titulo: 'Acromatopsia',
    descricao: 'Visão em tons de cinza (monocromacia).',
  },
];

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
  let nivel = 1;
  let rotulo = 'Fraca';
  let classeCor = 'fraca';

  if (!temEspaco && temMinimo8 && totalCumpridas === 4) {
    nivel = 3;
    rotulo = 'Forte';
    classeCor = 'forte';
  } else if (!temEspaco && temMinimo8 && totalCumpridas >= 3) {
    nivel = 2;
    rotulo = 'Média';
    classeCor = 'media';
  }

  return { nivel, rotulo, classeCor, regras, validaParaCadastro: !temEspaco && nivel >= 2 };
}

function IconeOlho({ aberto }) {
  return aberto ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconeCadeado({ tamanho = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconeAlerta() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function renderIconeAlergia(id) {
  switch (id) {
    case 'Glúten':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 22 10-10" />
          <path d="M16 8a2.5 2.5 0 1 0-3.5-3.5L11 6l1.5 3.5L16 8z" fill="currentColor" fillOpacity="0.2" />
          <path d="M19 11a2.5 2.5 0 1 0-3.5-3.5L14 9l1.5 3.5L19 11z" fill="currentColor" fillOpacity="0.2" />
          <path d="M8 12a2.5 2.5 0 1 0-3.5-3.5L3 10l1.5 3.5L8 12z" fill="currentColor" fillOpacity="0.2" />
          <path d="M11 15a2.5 2.5 0 1 0-3.5-3.5L6 13l1.5 3.5L11 15z" fill="currentColor" fillOpacity="0.2" />
          <path d="M14 18a2.5 2.5 0 1 0-3.5-3.5L9 16l1.5 3.5L14 18z" fill="currentColor" fillOpacity="0.2" />
          <path d="M14 4.5 18 2" />
          <path d="M17 7.5 21 5" />
        </svg>
      );
    case 'Leite / Lactose':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 8 10 2.5h4L17 8v12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5V8z" fill="currentColor" fillOpacity="0.1" />
          <path d="M7 8h10" />
          <path d="M10 2.5v5.5" />
          <path d="M12 11.5c-1.6 2-2.2 3.2-2.2 4.3a2.2 2.2 0 0 0 4.4 0c0-1.1-.6-2.3-2.2-4.3z" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case 'Ovo':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C7.5 2 4 7.2 4 13.5 4 18.2 7.6 22 12 22s8-3.8 8-8.5C20 7.2 16.5 2 12 2z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="14" r="3.6" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 7.5A6 6 0 0 1 12 4.5" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case 'Gergelim':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14.5C3 9 7 4.5 12 4.5s9 4.5 9 10H3z" fill="currentColor" fillOpacity="0.1" />
          <path d="M2.5 18.5h19" strokeWidth="2" />
          <path d="M3 14.5h18" strokeWidth="1.6" />
          <path d="M7.5 9c-.4.6-.7 1-.7 1.3a.7.7 0 0 0 1.4 0c0-.3-.3-.7-.7-1.3z" fill="currentColor" stroke="none" />
          <path d="M12 7c-.4.6-.7 1-.7 1.3a.7.7 0 0 0 1.4 0c0-.3-.3-.7-.7-1.3z" fill="currentColor" stroke="none" />
          <path d="M16.5 9c-.4.6-.7 1-.7 1.3a.7.7 0 0 0 1.4 0c0-.3-.3-.7-.7-1.3z" fill="currentColor" stroke="none" />
          <path d="M9.5 11.5c-.4.6-.7 1-.7 1.3a.7.7 0 0 0 1.4 0c0-.3-.3-.7-.7-1.3z" fill="currentColor" stroke="none" />
          <path d="M14.5 11.5c-.4.6-.7 1-.7 1.3a.7.7 0 0 0 1.4 0c0-.3-.3-.7-.7-1.3z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'Amendoim / Oleaginosas':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M12 2.5c-2.3 0-4.2 1.8-4.2 4 0 1.4.7 2.6 1.8 3.3-.8.6-1.3 1.5-1.3 2.5 0 1 .5 1.9 1.3 2.5-1.1.7-1.8 1.9-1.8 3.3 0 2.2 1.9 4 4.2 4s4.2-1.8 4.2-4c0-1.4-.7-2.6-1.8-3.3.8-.6 1.3-1.5 1.3-2.5 0-1-.5-1.9-1.3-2.5 1.1-.7 1.8-1.9 1.8-3.3 0-2.2-1.9-4-4.2-4z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <circle cx="12" cy="7" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
          <path d="M12 9.5v5" strokeDasharray="1.2 1.5" strokeWidth="1.5" />
        </svg>
      );
    case 'Frutos do Mar':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M4 12c1.8-4 5.5-6.5 10-6.5 3.2 0 5.2 2 6.5 5.5-1.5 3.5-3.8 6.5-8 6.5-4 0-7.2-2.2-8.5-5.5z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path d="M18.5 11l4-4.5v10l-4-4.5" fill="currentColor" fillOpacity="0.25" />
          <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
          <path d="M10.5 8.5c1 1.8 1 4.5 0 6.5" strokeWidth="1.5" />
          <path d="M12 5.5l2-2.5 1 2.5" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
  }
}

function renderIconePagamento(id) {
  switch (id) {
    case 'pix':
      return (
        <svg
          width="22"
          height="22"
          viewBox="534.4 25.4 80.9 80.9"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m 553.82362,44.963326 c 3.08046,0 5.97782,1.19944 8.15622,3.37679 l 11.81982,11.82193 c 0.85125,0.85161 2.2412,0.85479 3.09457,-10e-4 l 11.77678,-11.77784 c 2.1784,-2.17735 5.07576,-3.37679 8.15622,-3.37679 h 1.41852 l -14.95778,-14.95813 c -4.65878,-4.658432 -12.2114,-4.658432 -16.86948,0 l -14.91509,14.91509 z" />
          <path d="m 610.61844,57.378776 -9.03922,-9.03922 c -0.19897,0.0797 -0.41452,0.12946 -0.64206,0.12946 h -4.10986 c -2.12478,0 -4.20476,0.86184 -5.70618,2.36432 l -11.77643,11.77678 c -1.10207,1.10208 -2.55022,1.65347 -3.99697,1.65347 -1.44815,0 -2.89524,-0.55139 -3.99697,-1.65241 l -11.82088,-11.82088 c -1.50142,-1.50283 -3.5814,-2.36431 -5.70618,-2.36431 h -5.05354 c -0.21555,0 -0.41698,-0.0508 -0.60713,-0.12242 l -9.07521,9.07521 c -4.65843,4.65843 -4.65843,12.2107 0,16.86913 l 9.07486,9.07485 c 0.1905,-0.0716 0.39193,-0.12241 0.60748,-0.12241 h 5.05354 c 2.12478,0 4.20476,-0.86148 5.70618,-2.36396 l 11.81982,-11.81982 c 2.13643,-2.13466 5.8607,-2.13537 7.995,0.001 l 11.77643,11.77573 c 1.50142,1.50248 3.5814,2.36431 5.70618,2.36431 h 4.10986 c 0.22754,0 0.44309,0.0497 0.64206,0.12947 l 9.03922,-9.03922 c 4.65808,-4.65843 4.65808,-12.2107 0,-16.86913" />
          <path d="m 596.82737,86.620206 c -3.08045,0 -5.97782,-1.19944 -8.15622,-3.37679 l -11.77678,-11.77713 c -0.82691,-0.82903 -2.26801,-0.82656 -3.09456,0 l -11.81982,11.82017 c -2.17841,2.17734 -5.07577,3.37679 -8.15623,3.37679 h -2.32092 l 14.9158,14.915444 c 4.65807,4.65808 12.21069,4.65808 16.86912,0 l 14.95813,-14.958484 z" />
        </svg>
      );
    case 'cartao':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fillOpacity="0.1" />
          <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2.2" />
          <rect x="5" y="14" width="4" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
          <circle cx="17" cy="15" r="1.5" />
        </svg>
      );
    case 'balcao':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2.5" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
          <path d="M6 12h.01M18 12h.01" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function Configuracoes({
  usuarioLogado,
  onAtualizarNomeUsuario,
  temaEscuro,
  onDefinirTemaEscuro,
}) {
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [perfil, setPerfil] = useState(() => obterPerfilUsuarioAtual(usuarioLogado));

  // Campos editáveis da aba Perfil
  const [nomeInput, setNomeInput] = useState(perfil.nome || '');
  const [dataNascimentoInput, setDataNascimentoInput] = useState(() =>
    formatarIsoParaBr(perfil.dataNascimento || '')
  );
  const [modalConfirmarDataAberto, setModalConfirmarDataAberto] = useState(false);
  const [erroDataNascimento, setErroDataNascimento] = useState('');

  // Campos da aba Segurança (Alterar Senha)
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [mostrarPopoverRegras, setMostrarPopoverRegras] = useState(false);
  const [errosSenha, setErrosSenha] = useState({});

  // Mensagem de feedback (alerta interno)
  const [feedback, setFeedback] = useState(null);

  // Guarda o último tipo de daltonismo ativo para restaurar ao ligar o switch
  const [ultimoModoDaltonismo, setUltimoModoDaltonismo] = useState('protanopia');

  // Fecha o balão de regras de senha flutuante ao clicar fora
  useEffect(() => {
    if (!mostrarPopoverRegras) return;
    const handleCliqueFora = () => setMostrarPopoverRegras(false);
    document.addEventListener('click', handleCliqueFora);
    return () => document.removeEventListener('click', handleCliqueFora);
  }, [mostrarPopoverRegras]);

  useEffect(() => {
    const atualizado = obterPerfilUsuarioAtual(usuarioLogado);
    setPerfil(atualizado);
    setNomeInput(atualizado.nome || '');
    setDataNascimentoInput(formatarIsoParaBr(atualizado.dataNascimento || ''));
    if (atualizado.modoDaltonismo && atualizado.modoDaltonismo !== 'nenhum') {
      setUltimoModoDaltonismo(atualizado.modoDaltonismo);
    }
  }, [usuarioLogado]);

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  const exibirFeedback = (texto, tipo = 'sucesso') => {
    setFeedback({ texto, tipo });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Indica se a data de nascimento já foi salva anteriormente (Write-Once / Escrita Única)
  const dataNascimentoBloqueada = Boolean(perfil.dataNascimento);

  const executarSalvarPerfil = (nome, dataNascimentoFinal) => {
    const salvo = salvarPerfilUsuarioAtual({
      nome,
      dataNascimento: dataNascimentoBloqueada
        ? perfil.dataNascimento
        : dataNascimentoFinal || '',
    });
    setPerfil(salvo);
    setDataNascimentoInput(formatarIsoParaBr(salvo.dataNascimento || ''));

    if (onAtualizarNomeUsuario) {
      onAtualizarNomeUsuario(salvo.nome);
    }

    exibirFeedback('Dados do perfil salvos com sucesso!');
  };

  const handleSalvarPerfil = (e) => {
    e.preventDefault();
    const nomeLimpo = nomeInput.trim();
    if (!nomeLimpo) {
      exibirFeedback('Por favor, informe um nome válido para exibição.', 'erro');
      return;
    }

    // Se a data já está bloqueada (já foi gravada anteriormente), salva apenas alterações normais
    if (dataNascimentoBloqueada) {
      executarSalvarPerfil(nomeLimpo, perfil.dataNascimento);
      return;
    }

    // Se o usuário preencheu a data de nascimento pela primeira vez
    const dataDigitada = dataNascimentoInput.trim();
    if (dataDigitada) {
      const validacao = validarDataBr(dataDigitada);
      if (!validacao.valida) {
        setErroDataNascimento(validacao.motivo);
        exibirFeedback(validacao.motivo, 'erro');
        return;
      }
      setErroDataNascimento('');
      // Abre o modal de confirmação com a data digitada para confirmação explícita
      setModalConfirmarDataAberto(true);
      return;
    }

    // Se não preencheu a data de nascimento (deixou em branco), salva apenas o nome
    executarSalvarPerfil(nomeLimpo, '');
  };

  const handleConfirmarESalvarDataNascimento = () => {
    setModalConfirmarDataAberto(false);
    const nomeLimpo = nomeInput.trim();
    const dataIso = formatarBrParaIso(dataNascimentoInput.trim());
    executarSalvarPerfil(nomeLimpo, dataIso);
  };

  // Retorna o estado atual da pílula de uma alergia: 'nao' | 'padrao' | 'tenho'
  const obterEstadoAlergia = (idAlergia) => {
    if ((perfil.alergias || []).includes(idAlergia)) return 'tenho';
    if ((perfil.alergiasSemAviso || []).includes(idAlergia)) return 'nao';
    return 'padrao';
  };

  const handleDefinirEstadoAlergia = (idAlergia, novoEstado) => {
    const semEste = (lista) => (lista || []).filter((item) => item !== idAlergia);
    const alergias = semEste(perfil.alergias);
    const alergiasSemAviso = semEste(perfil.alergiasSemAviso);

    if (novoEstado === 'tenho') alergias.push(idAlergia);
    if (novoEstado === 'nao') alergiasSemAviso.push(idAlergia);

    const salvo = salvarPerfilUsuarioAtual({ alergias, alergiasSemAviso });
    setPerfil(salvo);
  };

  const handleSelecionarPagamento = (idMetodo) => {
    const salvo = salvarPerfilUsuarioAtual({ pagamentoPadrao: idMetodo });
    setPerfil(salvo);
    exibirFeedback('Preferência de pagamento padrão atualizada!');
  };

  const handleAlterarAcessibilidade = (chave, valor) => {
    const salvo = salvarPerfilUsuarioAtual({ [chave]: valor });
    setPerfil(salvo);
    aplicarAcessibilidadeNoDOM(salvo);
  };

  const handleAlterarTema = (modoEscuroDesejado) => {
    if (onDefinirTemaEscuro) {
      onDefinirTemaEscuro(modoEscuroDesejado);
    }
    const salvo = salvarPerfilUsuarioAtual({
      temaPreferido: modoEscuroDesejado ? 'escuro' : 'claro',
    });
    setPerfil(salvo);
  };

  const daltonismoAtivo = Boolean(perfil.modoDaltonismo && perfil.modoDaltonismo !== 'nenhum');
  const modoDaltonismoAtual = daltonismoAtivo ? perfil.modoDaltonismo : ultimoModoDaltonismo;
  const modoDaltonismoObj =
    TIPOS_DALTONISMO.find((m) => m.id === modoDaltonismoAtual) || TIPOS_DALTONISMO[0];
  const indiceModoDaltonismo = TIPOS_DALTONISMO.findIndex((m) => m.id === modoDaltonismoObj.id);

  const handleAlternarDaltonismo = (ativar) => {
    if (ativar) {
      const modoParaAtivar = ultimoModoDaltonismo || 'protanopia';
      handleAlterarAcessibilidade('modoDaltonismo', modoParaAtivar);
    } else {
      handleAlterarAcessibilidade('modoDaltonismo', 'nenhum');
    }
  };

  const handleModoDaltonismoAnterior = () => {
    const total = TIPOS_DALTONISMO.length;
    const novoIndice = (indiceModoDaltonismo - 1 + total) % total;
    const novoModo = TIPOS_DALTONISMO[novoIndice].id;
    setUltimoModoDaltonismo(novoModo);
    handleAlterarAcessibilidade('modoDaltonismo', novoModo);
  };

  const handleModoDaltonismoProximo = () => {
    const total = TIPOS_DALTONISMO.length;
    const novoIndice = (indiceModoDaltonismo + 1) % total;
    const novoModo = TIPOS_DALTONISMO[novoIndice].id;
    setUltimoModoDaltonismo(novoModo);
    handleAlterarAcessibilidade('modoDaltonismo', novoModo);
  };

  const avaliacaoNovaSenha = avaliarForcaSenha(novaSenha);

  const handleSalvarNovaSenha = (e) => {
    e.preventDefault();
    const novosErros = {};

    if (!senhaAtual.trim()) {
      novosErros.senhaAtual = 'Digite sua senha atual para confirmar a alteração.';
    } else if (/\s/.test(senhaAtual)) {
      novosErros.senhaAtual = 'A senha atual não pode conter espaços.';
    } else if (perfil.senha && perfil.senha !== senhaAtual) {
      novosErros.senhaAtual = 'A senha atual informada está incorreta.';
    }

    if (!novaSenha.trim()) {
      novosErros.novaSenha = 'Digite a nova senha desejada.';
    } else if (/\s/.test(novaSenha)) {
      novosErros.novaSenha = 'A nova senha não pode conter espaços.';
    } else if (!avaliacaoNovaSenha.validaParaCadastro) {
      novosErros.novaSenha =
        'A nova senha precisa ser pelo menos Média (clique na barra para ver as regras).';
    }

    if (!confirmarNovaSenha.trim()) {
      novosErros.confirmarNovaSenha = 'Confirme a nova senha.';
    } else if (/\s/.test(confirmarNovaSenha)) {
      novosErros.confirmarNovaSenha = 'A confirmação não pode conter espaços.';
    } else if (novaSenha !== confirmarNovaSenha) {
      novosErros.confirmarNovaSenha = 'A confirmação da nova senha não coincide.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErrosSenha(novosErros);
      return;
    }

    setErrosSenha({});
    const salvo = salvarPerfilUsuarioAtual({ senha: novaSenha });
    setPerfil(salvo);

    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setMostrarPopoverRegras(false);
    exibirFeedback('Sua senha foi atualizada com sucesso!');
  };

  const renderCampoSenha = (
    id,
    rotulo,
    valor,
    setValor,
    mostrar,
    setMostrar,
    placeholder,
    campoChave
  ) => {
    const erro = errosSenha[campoChave];

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
      }
    };

    const handlePaste = (e) => {
      const textoColado = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      if (textoColado.includes(' ')) {
        e.preventDefault();
        const semEspaco = textoColado.replace(/\s+/g, '');
        const input = e.target;
        const start = input.selectionStart ?? valor.length;
        const end = input.selectionEnd ?? valor.length;
        const novoValor = valor.slice(0, start) + semEspaco + valor.slice(end);
        setValor(novoValor);
        if (errosSenha[campoChave]) {
          setErrosSenha((prev) => ({ ...prev, [campoChave]: '' }));
        }
      }
    };

    return (
      <div className={`campo-config ${erro ? 'campo-com-erro' : ''}`}>
        <label htmlFor={id}>{rotulo}</label>
        <div className="input-senha-config-wrapper">
          <input
            id={id}
            type={mostrar ? 'text' : 'password'}
            value={valor}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={(e) => {
              const semEspaco = e.target.value.replace(/\s+/g, '');
              setValor(semEspaco);
              if (errosSenha[campoChave]) {
                setErrosSenha((prev) => ({ ...prev, [campoChave]: '' }));
              }
            }}
            placeholder={placeholder}
          />
          <button
            type="button"
            className="btn-olho-config"
            onClick={() => setMostrar((prev) => !prev)}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <IconeOlho aberto={mostrar} />
          </button>
        </div>
        {erro && <span className="mensagem-erro-campo">{erro}</span>}
      </div>
    );
  };

  return (
    <main className="conteudo-principal configuracoes-main">
      <div className="cabecalho-pagina-config">
        <div className="titulo-pagina-config">
          <span className="icone-moldura-config" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <div>
            <h2>Configurações da Conta</h2>
            <p>Gerencie seus dados pessoais, restrições alimentares, acessibilidade e segurança.</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`alerta-feedback-config ${feedback.tipo === 'erro' ? 'erro' : 'sucesso'}`}
          role="status"
        >
          <span>{feedback.tipo === 'erro' ? '✕' : '✓'}</span>
          <span>{feedback.texto}</span>
        </div>
      )}

      <div className="layout-sistema-config">
        {/* Menu Lateral de Abas */}
        <aside className="menu-lateral-config" aria-label="Seções de configuração">
          <button
            type="button"
            className={`aba-menu-config ${abaAtiva === 'perfil' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('perfil')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div className="texto-aba-config">
              <strong>Perfil e Dados</strong>
              <span>Nome, e-mail e nascimento</span>
            </div>
          </button>

          <button
            type="button"
            className={`aba-menu-config ${abaAtiva === 'preferencias' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('preferencias')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div className="texto-aba-config">
              <strong>Preferências & Alergias</strong>
              <span>Restrições e pagamento padrão</span>
            </div>
          </button>

          <button
            type="button"
            className={`aba-menu-config ${abaAtiva === 'acessibilidade' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('acessibilidade')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4.5" r="2.5"></circle>
              <path d="m10.2 6.3-3.9 3.9"></path>
              <path d="m13.8 6.3 3.9 3.9"></path>
              <path d="M12 9.5v6.5"></path>
              <path d="m9.5 22 2.5-6 2.5 6"></path>
            </svg>
            <div className="texto-aba-config">
              <strong>Acessibilidade</strong>
              <span>Tema, fonte, contraste e daltonismo</span>
            </div>
          </button>

          <button
            type="button"
            className={`aba-menu-config ${abaAtiva === 'seguranca' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('seguranca')}
          >
            <IconeCadeado tamanho={19} />
            <div className="texto-aba-config">
              <strong>Segurança</strong>
              <span>Alteração de senha</span>
            </div>
          </button>
        </aside>

        {/* Painel Principal da Aba Selecionada */}
        <section className="painel-conteudo-config">
          {/* ==========================================
              ABA 1: PERFIL E DADOS PESSOAIS
              ========================================== */}
          {abaAtiva === 'perfil' && (
            <form className="bloco-secao-config" onSubmit={handleSalvarPerfil}>
              <div className="cabecalho-bloco-config">
                <h3>Informações Pessoais</h3>
                <p>Estes dados identificam você nos pedidos da cantina e na retirada no balcão.</p>
              </div>

              <div className="grade-campos-config">
                <div className="campo-config">
                  <label htmlFor="config-nome">Nome de Exibição / Chamada no Balcão</label>
                  <input
                    id="config-nome"
                    type="text"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    placeholder="Como você quer ser chamado?"
                    required
                  />
                </div>

                <div className="campo-config">
                  <div className="linha-label-badge">
                    <label htmlFor="config-email">E-mail Institucional</label>
                    <span className="badge-status-config verificado">✓ Verificado</span>
                  </div>
                  <input
                    id="config-email"
                    type="email"
                    value={perfil.email}
                    readOnly
                    disabled
                    className="input-somente-leitura"
                  />
                </div>

                <div className="campo-config campo-largura-total campo-data-nascimento-container">
                  <div className="linha-label-badge">
                    <label htmlFor="config-nascimento">Data de Nascimento</label>
                    {dataNascimentoBloqueada && (
                      <span className="badge-status-config bloqueado">
                        <IconeCadeado tamanho={12} /> Salva
                      </span>
                    )}
                  </div>

                  <DatePickerCustomizado
                    id="config-nascimento"
                    valor={dataNascimentoInput}
                    onChange={(novaData) => {
                      setDataNascimentoInput(novaData);
                      if (erroDataNascimento) setErroDataNascimento('');
                    }}
                    desabilitado={dataNascimentoBloqueada}
                    temErro={Boolean(erroDataNascimento)}
                  />

                  {erroDataNascimento && (
                    <span className="mensagem-erro-campo">{erroDataNascimento}</span>
                  )}

                  {!dataNascimentoBloqueada ? (
                    <div className="aviso-ihc-aniversario">
                      <span className="icone-aviso-ihc" aria-hidden="true">
                        <IconeAlerta />
                      </span>
                      <span>
                        <strong>Atenção:</strong> a data de nascimento não poderá ser alterada
                        depois de salva.
                      </span>
                    </div>
                  ) : (
                    <div className="aviso-ihc-aniversario travado">
                      <span className="icone-aviso-ihc" aria-hidden="true">
                        <IconeCadeado tamanho={18} />
                      </span>
                      <span>
                        Sua data de nascimento já foi registrada e está bloqueada para
                        alterações. Caso tenha digitado errado por engano, solicite a correção
                        presencialmente à administração da cantina.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rodape-acoes-config">
                <button type="submit" className="btn-salvar-config">
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}

          {/* ==========================================
              ABA 2: PREFERÊNCIAS & ALERGIAS
              ========================================== */}
          {abaAtiva === 'preferencias' && (
            <div className="bloco-secao-config">
              <div className="cabecalho-bloco-config">
                <h3>Restrições Alimentares e Alergias</h3>
              </div>

              <div className="lista-alergias-config">
                {LISTA_ALERGIAS.map((item) => {
                  const estado = obterEstadoAlergia(item.id);
                  const indiceEstado = ESTADOS_ALERGIA.findIndex((e) => e.id === estado);

                  return (
                    <div key={item.id} className={`linha-alergia-config estado-${estado}`}>
                      <div className="conteudo-alergia-principal">
                        <div className="icone-alergia-moldura" aria-hidden="true">
                          {renderIconeAlergia(item.id)}
                        </div>
                        <div className="info-alergia-config">
                          <strong>{item.titulo}</strong>
                          <p>{item.descricao}</p>
                          {DESCRICAO_ESTADO_ALERGIA[estado] && (
                            <span className="status-alergia-config">
                              {DESCRICAO_ESTADO_ALERGIA[estado]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`pilula-tripla estado-${estado}`}
                        role="radiogroup"
                        aria-label={`Preferência para ${item.titulo}`}
                        style={{ '--indice-pilula': indiceEstado }}
                      >
                        <span className="indicador-pilula-tripla" aria-hidden="true" />
                        {ESTADOS_ALERGIA.map((opcao) => (
                          <button
                            key={opcao.id}
                            type="button"
                            role="radio"
                            aria-checked={estado === opcao.id}
                            className={`opcao-pilula-tripla ${
                              estado === opcao.id ? 'ativa' : ''
                            }`}
                            onClick={() => handleDefinirEstadoAlergia(item.id, opcao.id)}
                          >
                            {opcao.rotulo}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="divisor-secao-config" />

              <div className="cabecalho-bloco-config">
                <h3>Método de Pagamento Padrão</h3>
                <p>
                  Escolha sua forma de pagamento preferida para deixá-la pré-selecionada
                  automaticamente na hora de fechar seus pedidos.
                </p>
              </div>

              <div className="lista-pagamentos-config">
                {METODOS_PAGAMENTO.map((metodo) => {
                  const ativo = perfil.pagamentoPadrao === metodo.id;
                  return (
                    <label
                      key={metodo.id}
                      className={`card-pagamento-config metodo-${metodo.id} ${ativo ? 'ativo' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pagamentoPadrao"
                        value={metodo.id}
                        checked={ativo}
                        onChange={() => handleSelecionarPagamento(metodo.id)}
                      />
                      <div className="icone-pagamento-moldura" aria-hidden="true">
                        {renderIconePagamento(metodo.id)}
                      </div>
                      <div className="info-pagamento-config">
                        <strong>{metodo.titulo}</strong>
                        <span>{metodo.descricao}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              ABA 3: ACESSIBILIDADE E APARÊNCIA
              ========================================== */}
          {abaAtiva === 'acessibilidade' && (
            <div className="bloco-secao-config">
              <div className="cabecalho-bloco-config">
                <h3>Acessibilidade e Conforto Visual</h3>
                <p>
                  Personalize a leitura, as cores e o comportamento visual do site. As mudanças
                  são aplicadas imediatamente.
                </p>
              </div>

              {/* 1. Tema Claro / Escuro */}
              <div className="item-controle-acessibilidade">
                <div className="texto-controle-acessibilidade">
                  <strong>Tema da Interface</strong>
                  <span>Visual Creme/Sálvia (claro) ou Grafite/Oliva (escuro).</span>
                </div>
                <div className="grupo-botoes-segmentados">
                  <button
                    type="button"
                    className={`btn-segmentado ${!temaEscuro ? 'ativo' : ''}`}
                    onClick={() => handleAlterarTema(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    Claro
                  </button>
                  <button
                    type="button"
                    className={`btn-segmentado ${temaEscuro ? 'ativo' : ''}`}
                    onClick={() => handleAlterarTema(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Escuro
                  </button>
                </div>
              </div>

              {/* 2. Escala de Fonte (cada botão já é exibido no tamanho que aplica) */}
              <div className="item-controle-acessibilidade">
                <div className="texto-controle-acessibilidade">
                  <strong>Tamanho da Fonte</strong>
                  <span>Aumenta proporcionalmente os textos de todas as páginas.</span>
                </div>
                <div className="grupo-botoes-segmentados alinhar-base">
                  {OPCOES_FONTE.map((opcao) => (
                    <button
                      key={opcao.id}
                      type="button"
                      data-tamanho={opcao.id}
                      className={`btn-segmentado btn-escala-fonte ${
                        perfil.tamanhoFonte === opcao.id ? 'ativo' : ''
                      }`}
                      style={{ fontSize: opcao.tamanhoPx }}
                      onClick={() => handleAlterarAcessibilidade('tamanhoFonte', opcao.id)}
                    >
                      {opcao.rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Reduzir Movimento */}
              <div className="item-controle-acessibilidade">
                <div className="texto-controle-acessibilidade">
                  <strong>Reduzir Animações</strong>
                  <span>
                    Pausa carrosséis automáticos, o card flutuante de promoções e efeitos de
                    transição.
                  </span>
                </div>
                <label className="switch-cantina">
                  <input
                    type="checkbox"
                    checked={Boolean(perfil.reduzirMovimento)}
                    onChange={(e) =>
                      handleAlterarAcessibilidade('reduzirMovimento', e.target.checked)
                    }
                  />
                  <span className="slider-switch-cantina"></span>
                </label>
              </div>

              {/* 4. Alto Contraste */}
              <div className="item-controle-acessibilidade bloco-com-escala">
                <div className="linha-controle-com-switch">
                  <div className="texto-controle-acessibilidade">
                    <strong>Alto Contraste e Destaque de Foco</strong>
                    <span>
                      Textos e bordas mais nítidos em todo o site, com contorno reforçado na
                      navegação por teclado (Tab).
                    </span>
                  </div>
                  <label className="switch-cantina">
                    <input
                      type="checkbox"
                      checked={Boolean(perfil.altoContraste)}
                      onChange={(e) =>
                        handleAlterarAcessibilidade('altoContraste', e.target.checked)
                      }
                    />
                    <span className="slider-switch-cantina"></span>
                  </label>
                </div>

                {/* Escala de ajuste de contraste (surge quando o alto contraste está ativado) */}
                {perfil.altoContraste && (
                  <div className="bloco-escala-daltonismo">
                    <div className="cabecalho-escala-daltonismo">
                      <label htmlFor="slider-grau-contraste" className="label-escala-daltonismo">
                        Intensidade
                      </label>
                      <span className="badge-valor-grau">
                        {Math.round((perfil.grauContraste ?? 0.5) * 100)}%
                      </span>
                    </div>
                    <div className="container-slider-grau">
                      <span className="rotulo-extremo-grau">0</span>
                      <input
                        id="slider-grau-contraste"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={perfil.grauContraste ?? 0.5}
                        onChange={(e) =>
                          handleAlterarAcessibilidade('grauContraste', parseFloat(e.target.value))
                        }
                        className="slider-grau-cantina"
                        aria-label="Ajustar intensidade do contraste de 0 a 1"
                      />
                      <span className="rotulo-extremo-grau">1</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Modo para Daltonismo (Switch no topo + Seletor com Setas + Mini Card RGB + Slider) */}
              <div className="item-controle-acessibilidade bloco-com-escala">
                <div className="linha-controle-com-switch">
                  <div className="texto-controle-acessibilidade">
                    <strong>Modo para Daltonismo</strong>
                    <span>
                      Ajusta as cores do site para facilitar a distinção entre tons, de acordo com o
                      tipo de daltonismo.
                    </span>
                  </div>
                  <label className="switch-cantina">
                    <input
                      type="checkbox"
                      checked={daltonismoAtivo}
                      onChange={(e) => handleAlternarDaltonismo(e.target.checked)}
                    />
                    <span className="slider-switch-cantina"></span>
                  </label>
                </div>

                {/* Conteúdo expansível (só aparece quando o modo estiver ativado pelo switch) */}
                {daltonismoAtivo && (
                  <div className="conteudo-daltonismo">
                    {/* Linha com o Seletor de Setas (Anterior / Próximo) e o Mini Diagrama RGB */}
                    <div className="linha-controle-daltonismo">
                      <div className="coluna-seletor-daltonismo">
                        <label className="label-seletor-daltonismo">
                          Tipo de visão
                        </label>

                        {/* Seletor de Setas (Anterior / Próximo) - Sem menus cortados para fora */}
                        <div className="seletor-setas-daltonismo">
                          <button
                            type="button"
                            className="btn-seta-daltonismo"
                            onClick={handleModoDaltonismoAnterior}
                            title="Tipo de daltonismo anterior"
                            aria-label="Tipo de daltonismo anterior"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 18 9 12 15 6" />
                            </svg>
                          </button>

                          <div className="info-modo-daltonismo-setas">
                            <span className="indicador-passo-daltonismo">
                              {indiceModoDaltonismo + 1} de {TIPOS_DALTONISMO.length}
                            </span>
                            <strong>{modoDaltonismoObj.titulo}</strong>
                            <span>{modoDaltonismoObj.descricao}</span>
                          </div>

                          <button
                            type="button"
                            className="btn-seta-daltonismo"
                            onClick={handleModoDaltonismoProximo}
                            title="Próximo tipo de daltonismo"
                            aria-label="Próximo tipo de daltonismo"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Mini Card Compacto com o Diagrama de Venn RGB */}
                      <div
                        className="mini-card-diagrama-rgb"
                        title={`Prévia das cores primárias RGB com o filtro ${modoDaltonismoObj.titulo}`}
                        aria-label="Diagrama compacto das cores RGB em união"
                      >
                        <svg
                          viewBox="0 0 160 140"
                          className="svg-mini-diagrama-rgb"
                          role="img"
                          aria-hidden="true"
                        >
                          <rect width="160" height="140" rx="10" fill="#151a19" />
                          <g style={{ isolation: 'isolate' }}>
                            <circle
                              cx="80"
                              cy="52"
                              r="35"
                              fill="#FF0000"
                              style={{ mixBlendMode: 'screen' }}
                            />
                            <circle
                              cx="60"
                              cy="88"
                              r="35"
                              fill="#00FF00"
                              style={{ mixBlendMode: 'screen' }}
                            />
                            <circle
                              cx="100"
                              cy="88"
                              r="35"
                              fill="#0000FF"
                              style={{ mixBlendMode: 'screen' }}
                            />
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Escala de ajuste fino (0 a 1, suave de 0.01 em 0.01, padrão 50%) */}
                    <div className="bloco-escala-daltonismo">
                      <div className="cabecalho-escala-daltonismo">
                        <label htmlFor="slider-grau-daltonismo" className="label-escala-daltonismo">
                          Intensidade
                        </label>
                        <span className="badge-valor-grau">
                          {Math.round((perfil.grauDaltonismo ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="container-slider-grau">
                        <span className="rotulo-extremo-grau">0</span>
                        <input
                          id="slider-grau-daltonismo"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={perfil.grauDaltonismo ?? 0.5}
                          onChange={(e) =>
                            handleAlterarAcessibilidade('grauDaltonismo', parseFloat(e.target.value))
                          }
                          className="slider-grau-cantina"
                          aria-label="Ajustar intensidade do filtro de daltonismo de 0 a 1"
                        />
                        <span className="rotulo-extremo-grau">1</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              ABA 4: SEGURANÇA DA CONTA
              ========================================== */}
          {abaAtiva === 'seguranca' && (
            <form className="bloco-secao-config" onSubmit={handleSalvarNovaSenha}>
              <div className="cabecalho-bloco-config">
                <h3>Alterar Senha de Acesso</h3>
                <p>
                  Escolha uma senha forte para proteger seus pedidos e seu histórico na Cantina
                  Serra e Soares.
                </p>
              </div>

              <div className="grade-campos-config coluna-unica-seguranca">
                {renderCampoSenha(
                  'config-senha-atual',
                  'Senha Atual',
                  senhaAtual,
                  setSenhaAtual,
                  mostrarSenhaAtual,
                  setMostrarSenhaAtual,
                  'Digite sua senha atual',
                  'senhaAtual'
                )}

                <div className={`campo-config ${errosSenha.novaSenha ? 'campo-com-erro' : ''}`}>
                  <label htmlFor="config-nova-senha">Nova Senha</label>
                  <div className="input-senha-config-wrapper">
                    <input
                      id="config-nova-senha"
                      type={mostrarNovaSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.code === 'Space') {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        const textoColado = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                        if (textoColado.includes(' ')) {
                          e.preventDefault();
                          const semEspaco = textoColado.replace(/\s+/g, '');
                          const input = e.target;
                          const start = input.selectionStart ?? novaSenha.length;
                          const end = input.selectionEnd ?? novaSenha.length;
                          const novoValor = novaSenha.slice(0, start) + semEspaco + novaSenha.slice(end);
                          setNovaSenha(novoValor);
                          if (errosSenha.novaSenha) {
                            setErrosSenha((prev) => ({ ...prev, novaSenha: '' }));
                          }
                        }
                      }}
                      onChange={(e) => {
                        const semEspaco = e.target.value.replace(/\s+/g, '');
                        setNovaSenha(semEspaco);
                        if (errosSenha.novaSenha) {
                          setErrosSenha((prev) => ({ ...prev, novaSenha: '' }));
                        }
                      }}
                      placeholder="Mínimo de 8 caracteres"
                    />
                    <button
                      type="button"
                      className="btn-olho-config"
                      onClick={() => setMostrarNovaSenha((prev) => !prev)}
                      aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <IconeOlho aberto={mostrarNovaSenha} />
                    </button>
                  </div>

                  {/* Mensagem de erro posicionada exatamente entre o campo e a barra */}
                  {errosSenha.novaSenha && (
                    <span className="mensagem-erro-campo">{errosSenha.novaSenha}</span>
                  )}

                  {/* Medidor Centralizado de Força da Senha - SÓ aparece quando há texto */}
                  {novaSenha.length > 0 && (
                    <div
                      className="container-forca-senha-config"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMostrarPopoverRegras((prev) => !prev);
                      }}
                      role="button"
                      tabIndex={0}
                      title="Clique para ver os requisitos da senha"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setMostrarPopoverRegras((prev) => !prev);
                        }
                      }}
                    >
                      <div className="barras-forca-senha-config">
                        <span className={`segmento-forca-config ativo ${avaliacaoNovaSenha.classeCor}`} />
                        <span
                          className={`segmento-forca-config ${
                            avaliacaoNovaSenha.nivel >= 2 ? `ativo ${avaliacaoNovaSenha.classeCor}` : ''
                          }`}
                        />
                        <span
                          className={`segmento-forca-config ${
                            avaliacaoNovaSenha.nivel >= 3 ? `ativo ${avaliacaoNovaSenha.classeCor}` : ''
                          }`}
                        />
                      </div>
                      <span className={`rotulo-forca-senha-config ${avaliacaoNovaSenha.classeCor}`}>
                        Senha {avaliacaoNovaSenha.rotulo}
                      </span>

                      {/* Balão flutuante idêntico ao da tela de cadastro */}
                      {mostrarPopoverRegras && (
                        <div
                          className="balao-regras-senha-config"
                          role="status"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ul className="lista-regras-senha-config">
                            {avaliacaoNovaSenha.regras.map((regra) => (
                              <li
                                key={regra.id}
                                className={regra.cumprida ? 'cumprida' : 'pendente'}
                              >
                                <span className="icone-regra-senha-config">
                                  {regra.cumprida ? '✓' : '✕'}
                                </span>
                                <span>{regra.texto}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {renderCampoSenha(
                  'config-confirmar-senha',
                  'Confirmar Nova Senha',
                  confirmarNovaSenha,
                  setConfirmarNovaSenha,
                  mostrarConfirmarSenha,
                  setMostrarConfirmarSenha,
                  'Repita a nova senha',
                  'confirmarNovaSenha'
                )}
              </div>

              <div className="rodape-acoes-config">
                <button type="submit" className="btn-salvar-config">
                  Atualizar Senha
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* Modal de Confirmação de Data de Nascimento (Preenchimento Único) */}
      {modalConfirmarDataAberto && (
        <div
          className="modal-confirmar-data-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-confirmar-data-overlay')) {
              setModalConfirmarDataAberto(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-confirmar-data"
        >
          <div className="card-modal-confirmar-data">
            <div className="cabecalho-modal-confirmar-data">
              <div className="icone-destaque-modal-data" aria-hidden="true">
                <svg
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h3 id="titulo-modal-confirmar-data">Confirmar Data de Nascimento</h3>
                <p>Verifique os dados com atenção antes de gravar</p>
              </div>
              <button
                type="button"
                className="btn-fechar-modal-data"
                onClick={() => setModalConfirmarDataAberto(false)}
                aria-label="Fechar modal"
              >
                &times;
              </button>
            </div>

            <div className="corpo-modal-confirmar-data">
              <div className="caixa-data-destaque">
                <span className="rotulo-caixa-data">Data Informada</span>
                <strong className="valor-data-destaque">{dataNascimentoInput}</strong>
                <span className="valor-data-extenso">
                  {formatarDataPorExtenso(dataNascimentoInput)}
                </span>
              </div>

              <div className="aviso-modal-gravacao-unica">
                <span className="icone-aviso-modal" aria-hidden="true">
                  <IconeCadeado tamanho={16} />
                </span>
                <div className="texto-aviso-modal">
                  <p>
                    <strong>Preenchimento Único:</strong> por segurança e benefícios da cantina, esta data <strong>não poderá ser alterada</strong> após salva.
                  </p>
                </div>
              </div>

              <p className="pergunta-confirmacao-modal">
                Tem certeza de que a data informada está correta?
              </p>
            </div>

            <div className="rodape-modal-confirmar-data">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setModalConfirmarDataAberto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-confirmar"
                onClick={handleConfirmarESalvarDataNascimento}
              >
                Confirmar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Configuracoes;
