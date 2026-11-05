const CHAVE_LISTA_USUARIOS = 'db_cantina_users';
const CHAVE_USUARIO_ATUAL = 'db_cantina_user';
const CHAVE_NOME_LOGADO = 'usuario_cantina';

export const CONFIG_PADRAO_USUARIO = {
  nome: 'Fabricio',
  email: 'fabricio@aluno.ifsp.edu.br',
  dataCadastro: new Date().toISOString().slice(0, 10),
  dataNascimento: '',
  dataPreenchimentoAniversario: null,
  ultimoResgateAniversario: null,
  alergias: [], // Grupos marcados como "Tenho alergia" (alerta reforçado)
  alergiasSemAviso: [], // Grupos marcados como "Não tenho" (oculta o aviso genérico do site)
  pagamentoPadrao: 'pix',
  temaPreferido: 'claro',
  tamanhoFonte: 'normal', // 'normal' | 'medio' | 'grande'
  reduzirMovimento: false,
  altoContraste: false,
  grauContraste: 0.5, // Intensidade do alto contraste de 0 (natural do site) a 1 (máximo)
  modoDaltonismo: 'nenhum', // 'nenhum' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'acromatopsia'
  grauDaltonismo: 0.5, // Intensidade do filtro de daltonismo de 0 (nada) a 1 (máximo)
};

export const MODOS_DALTONISMO = [
  'nenhum',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'acromatopsia',
];

export function obterListaUsuariosSalvos() {
  try {
    const bruto = localStorage.getItem(CHAVE_LISTA_USUARIOS);
    if (bruto) {
      const parseado = JSON.parse(bruto);
      if (Array.isArray(parseado)) return parseado;
    }
  } catch {
    // Ignora JSON inválido
  }
  return [];
}

export function obterPerfilUsuarioAtual(nomeLogadoFallback = null) {
  const nomeSessao = nomeLogadoFallback || localStorage.getItem(CHAVE_NOME_LOGADO) || 'Fabricio';
  let usuarioSalvo = null;

  try {
    const brutoAtual = localStorage.getItem(CHAVE_USUARIO_ATUAL);
    if (brutoAtual) {
      usuarioSalvo = JSON.parse(brutoAtual);
    }
  } catch {
    usuarioSalvo = null;
  }

  const lista = obterListaUsuariosSalvos();
  if (usuarioSalvo?.email) {
    const daLista = lista.find(
      (u) => u.email?.toLowerCase() === usuarioSalvo.email.toLowerCase()
    );
    if (daLista) {
      usuarioSalvo = { ...daLista, ...usuarioSalvo };
    }
  } else if (nomeSessao) {
    const porNome = lista.find(
      (u) => u.nome?.toLowerCase() === nomeSessao.toLowerCase()
    );
    if (porNome) {
      usuarioSalvo = porNome;
    }
  }

  const emailPadrao =
    usuarioSalvo?.email ||
    `${nomeSessao.toLowerCase().replace(/\s+/g, '.')}@aluno.ifsp.edu.br`;

  return {
    ...CONFIG_PADRAO_USUARIO,
    ...usuarioSalvo,
    nome: usuarioSalvo?.nome || nomeSessao,
    email: emailPadrao,
    alergias: Array.isArray(usuarioSalvo?.alergias) ? usuarioSalvo.alergias : [],
    alergiasSemAviso: Array.isArray(usuarioSalvo?.alergiasSemAviso)
      ? usuarioSalvo.alergiasSemAviso
      : [],
    pagamentoPadrao: usuarioSalvo?.pagamentoPadrao || 'pix',
    tamanhoFonte: usuarioSalvo?.tamanhoFonte || 'normal',
    reduzirMovimento: Boolean(usuarioSalvo?.reduzirMovimento),
    altoContraste: Boolean(usuarioSalvo?.altoContraste),
    grauContraste:
      typeof usuarioSalvo?.grauContraste === 'number'
        ? Math.min(1, Math.max(0, usuarioSalvo.grauContraste))
        : 0.5,
    modoDaltonismo: MODOS_DALTONISMO.includes(usuarioSalvo?.modoDaltonismo)
      ? usuarioSalvo.modoDaltonismo
      : 'nenhum',
    grauDaltonismo:
      typeof usuarioSalvo?.grauDaltonismo === 'number'
        ? Math.min(1, Math.max(0, usuarioSalvo.grauDaltonismo))
        : 0.5,
  };
}

export function salvarPerfilUsuarioAtual(novosDados) {
  const atual = obterPerfilUsuarioAtual();
  const atualizado = {
    ...atual,
    ...novosDados,
  };

  // Regra Write-Once (Escrita Única): se já havia dataNascimento salva, não permite sobrescrever
  if (atual.dataNascimento && novosDados.dataNascimento && atual.dataNascimento !== novosDados.dataNascimento) {
    atualizado.dataNascimento = atual.dataNascimento;
    atualizado.dataPreenchimentoAniversario = atual.dataPreenchimentoAniversario;
  } else if (!atual.dataNascimento && atualizado.dataNascimento) {
    atualizado.dataPreenchimentoAniversario =
      atualizado.dataPreenchimentoAniversario || new Date().toISOString().slice(0, 10);
  }

  localStorage.setItem(CHAVE_USUARIO_ATUAL, JSON.stringify(atualizado));
  if (atualizado.nome) {
    localStorage.setItem(CHAVE_NOME_LOGADO, atualizado.nome);
  }

  const lista = obterListaUsuariosSalvos();
  const emailNormalizado = (atualizado.email || '').trim().toLowerCase();
  const idx = lista.findIndex((u) => (u.email || '').toLowerCase() === emailNormalizado);
  if (idx >= 0) {
    lista[idx] = { ...lista[idx], ...atualizado };
  } else if (emailNormalizado) {
    lista.push(atualizado);
  }
  localStorage.setItem(CHAVE_LISTA_USUARIOS, JSON.stringify(lista));

  // Dispara evento customizado para sincronizar componentes da mesma aba
  window.dispatchEvent(new CustomEvent('cantina-perfil-atualizado', { detail: atualizado }));
  return atualizado;
}

export function calcularMatrizDaltonismo(modo, grau = 0.5) {
  const alpha = Math.min(1, Math.max(0, Number(grau) || 0));

  if (modo === 'protanopia') {
    // Modelo clínico de Protanopia (dificuldade de percepção de vermelho / cones L)
    const r1 = (1 - 0.43333 * alpha).toFixed(4);
    const g1 = (0.43333 * alpha).toFixed(4);
    const r2 = (0.55833 * alpha).toFixed(4);
    const g2 = (1 - 0.55833 * alpha).toFixed(4);
    const g3 = (0.24167 * alpha).toFixed(4);
    const b3 = (1 - 0.24167 * alpha).toFixed(4);
    return `${r1} ${g1} 0 0 0  ${r2} ${g2} 0 0 0  0 ${g3} ${b3} 0 0  0 0 0 1 0`;
  }

  if (modo === 'deuteranopia') {
    // Modelo clínico de Deuteranopia (dificuldade de percepção de verde / cones M)
    const r1 = (1 - 0.375 * alpha).toFixed(4);
    const g1 = (0.375 * alpha).toFixed(4);
    const r2 = (0.7 * alpha).toFixed(4);
    const g2 = (1 - 0.7 * alpha).toFixed(4);
    const g3 = (0.3 * alpha).toFixed(4);
    const b3 = (1 - 0.3 * alpha).toFixed(4);
    return `${r1} ${g1} 0 0 0  ${r2} ${g2} 0 0 0  0 ${g3} ${b3} 0 0  0 0 0 1 0`;
  }

  if (modo === 'tritanopia') {
    // Modelo clínico de Tritanopia (dificuldade de percepção de azul/amarelo / cones S)
    const r1 = (1 - 0.05 * alpha).toFixed(4);
    const g1 = (0.05 * alpha).toFixed(4);
    const g2 = (1 - 0.56667 * alpha).toFixed(4);
    const b2 = (0.56667 * alpha).toFixed(4);
    const g3 = (0.475 * alpha).toFixed(4);
    const b3 = (1 - 0.475 * alpha).toFixed(4);
    return `${r1} ${g1} 0 0 0  0 ${g2} ${b2} 0 0  0 ${g3} ${b3} 0 0  0 0 0 1 0`;
  }

  return '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0';
}

export function aplicarAcessibilidadeNoDOM(perfil) {
  const root = document.documentElement;
  if (!perfil) return;

  // Tamanho da fonte
  root.classList.remove('fonte-media', 'fonte-grande');
  if (perfil.tamanhoFonte === 'medio') {
    root.classList.add('fonte-media');
  } else if (perfil.tamanhoFonte === 'grande') {
    root.classList.add('fonte-grande');
  }

  // Reduzir animações / movimento
  if (perfil.reduzirMovimento) {
    root.classList.add('reduzir-movimento');
  } else {
    root.classList.remove('reduzir-movimento');
  }

  // Alto contraste e sua intensidade (0 a 1)
  const grauContraste =
    typeof perfil.grauContraste === 'number' ? perfil.grauContraste : 0.5;
  root.style.setProperty('--grau-contraste', String(grauContraste));

  if (perfil.altoContraste) {
    root.classList.add('alto-contraste');
  } else {
    root.classList.remove('alto-contraste');
  }

  // Grau de daltonismo (0 a 1) aplicado como variável CSS e recalculado nas matrizes SVG
  const grau = typeof perfil.grauDaltonismo === 'number' ? perfil.grauDaltonismo : 0.5;
  root.style.setProperty('--grau-daltonismo', String(grau));

  if (typeof document !== 'undefined') {
    const matProtanopia = document.querySelector('#filtro-protanopia feColorMatrix');
    if (matProtanopia) {
      matProtanopia.setAttribute('values', calcularMatrizDaltonismo('protanopia', grau));
    }
    const matDeuteranopia = document.querySelector('#filtro-deuteranopia feColorMatrix');
    if (matDeuteranopia) {
      matDeuteranopia.setAttribute('values', calcularMatrizDaltonismo('deuteranopia', grau));
    }
    const matTritanopia = document.querySelector('#filtro-tritanopia feColorMatrix');
    if (matTritanopia) {
      matTritanopia.setAttribute('values', calcularMatrizDaltonismo('tritanopia', grau));
    }
  }

  // Modo para daltonismo (filtros de correção de cor aplicados no <html>)
  MODOS_DALTONISMO.forEach((modo) => root.classList.remove(`daltonismo-${modo}`));
  if (perfil.modoDaltonismo && perfil.modoDaltonismo !== 'nenhum') {
    root.classList.add(`daltonismo-${perfil.modoDaltonismo}`);
  }
}
