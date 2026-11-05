import { useState, useRef, useEffect } from 'react';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/AAAA)
 */
export function formatarIsoParaBr(isoStr) {
  if (!isoStr) return '';
  const limpo = String(isoStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    const [ano, mes, dia] = limpo.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return limpo;
}

/**
 * Converte data brasileira (DD/MM/AAAA) para formato ISO (YYYY-MM-DD)
 */
export function formatarBrParaIso(brStr) {
  if (!brStr) return '';
  const limpo = String(brStr).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpo)) {
    const [dia, mes, ano] = limpo.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return limpo;
}

/**
 * Valida se uma string DD/MM/AAAA é válida no calendário civil e não é futura
 */
export function validarDataBr(dataStr) {
  if (!dataStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    return { valida: false, motivo: 'Data incompleta. Use o formato DD/MM/AAAA.' };
  }
  const [diaStr, mesStr, anoStr] = dataStr.split('/');
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  const ano = parseInt(anoStr, 10);

  if (ano < 1920) {
    return { valida: false, motivo: 'O ano informado deve ser a partir de 1920.' };
  }

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  if (ano > anoAtual) {
    return { valida: false, motivo: 'A data de nascimento não pode estar no futuro.' };
  }

  if (mes < 1 || mes > 12) {
    return { valida: false, motivo: 'Mês inválido (deve ser entre 01 e 12).' };
  }

  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) {
    return { valida: false, motivo: `Dia inválido para o mês ${mesStr}/${anoStr}.` };
  }

  const dataObj = new Date(ano, mes - 1, dia);
  // Zera horas para comparação justa com o dia de hoje
  const hojeMeiaNoite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (dataObj > hojeMeiaNoite) {
    return { valida: false, motivo: 'A data de nascimento não pode estar no futuro.' };
  }

  return { valida: true, dia, mes, ano, dataObj };
}

/**
 * Formata data para exibição por extenso amigável (ex: "04 de Novembro de 2004")
 */
export function formatarDataPorExtenso(dataStr) {
  if (!dataStr) return '';
  let dia, mes, ano;
  if (dataStr.includes('/')) {
    const partes = dataStr.split('/');
    dia = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10);
    ano = parseInt(partes[2], 10);
  } else if (dataStr.includes('-')) {
    const partes = dataStr.split('-');
    ano = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10);
    dia = parseInt(partes[2], 10);
  } else {
    return dataStr;
  }
  if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
    return `${String(dia).padStart(2, '0')} de ${MESES[mes - 1]} de ${ano}`;
  }
  return dataStr;
}

/**
 * Componente de Seletor de Data customizado com máscara suave e calendário popover
 */
export default function DatePickerCustomizado({
  id = 'seletor-data',
  valor = '',
  onChange,
  desabilitado = false,
  temErro = false,
  anoMaximo = new Date().getFullYear(),
  anoMinimo = 1920,
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const hoje = new Date();
  const dataValida = validarDataBr(valor);

  // Define mês e ano visíveis iniciais (se já tiver data válida, foca nela; senão sugere ano padrão estudantil 2005)
  const [mesVisivel, setMesVisivel] = useState(() =>
    dataValida.valida ? dataValida.mes - 1 : hoje.getMonth()
  );
  const [anoVisivel, setAnoVisivel] = useState(() =>
    dataValida.valida ? dataValida.ano : Math.min(2005, anoMaximo)
  );

  useEffect(() => {
    if (dataValida.valida) {
      setMesVisivel(dataValida.mes - 1);
      setAnoVisivel(dataValida.ano);
    }
  }, [valor]);

  // Fecha o calendário ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    if (!aberto) return;

    const handleCliqueFora = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleCliqueFora);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleCliqueFora);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [aberto]);

  // Aplica a máscara suave número a número sem pular de foco
  const handleInputChange = (e) => {
    const digitos = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatado = digitos;
    if (digitos.length > 2 && digitos.length <= 4) {
      formatado = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    } else if (digitos.length > 4) {
      formatado = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    }
    onChange(formatado);
  };

  const handleMudarMes = (delta) => {
    let novoMes = mesVisivel + delta;
    let novoAno = anoVisivel;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    if (novoAno >= anoMinimo && novoAno <= anoMaximo) {
      setMesVisivel(novoMes);
      setAnoVisivel(novoAno);
    }
  };

  const handleSelecionarDia = (dia) => {
    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mesVisivel + 1).padStart(2, '0');
    const novoValor = `${diaFormatado}/${mesFormatado}/${anoVisivel}`;
    onChange(novoValor);
    setAberto(false);
  };

  const primeiroDiaSemana = new Date(anoVisivel, mesVisivel, 1).getDay();
  const totalDiasMes = new Date(anoVisivel, mesVisivel + 1, 0).getDate();

  const anosDisponiveis = [];
  for (let a = anoMaximo; a >= anoMinimo; a--) {
    anosDisponiveis.push(a);
  }

  const ehDiaSelecionado = (dia) => {
    if (!dataValida.valida) return false;
    return (
      dataValida.dia === dia &&
      dataValida.mes - 1 === mesVisivel &&
      dataValida.ano === anoVisivel
    );
  };

  const ehDiaFuturo = (dia) => {
    const dataChecar = new Date(anoVisivel, mesVisivel, dia);
    const hojeMeiaNoite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return dataChecar > hojeMeiaNoite;
  };

  const ehDiaHoje = (dia) => {
    return (
      hoje.getDate() === dia &&
      hoje.getMonth() === mesVisivel &&
      hoje.getFullYear() === anoVisivel
    );
  };

  return (
    <div
      className={`datepicker-custom-wrapper ${temErro ? 'com-erro' : ''}`}
      ref={containerRef}
    >
      <div className="datepicker-input-container">
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          maxLength={10}
          value={valor}
          onChange={handleInputChange}
          disabled={desabilitado}
          readOnly={desabilitado}
          className={`datepicker-input ${desabilitado ? 'input-somente-leitura' : ''}`}
        />
        <button
          type="button"
          className="datepicker-btn-toggle"
          disabled={desabilitado}
          onClick={() => setAberto((prev) => !prev)}
          aria-label={aberto ? 'Fechar calendário' : 'Abrir calendário'}
          title={aberto ? 'Fechar calendário' : 'Escolher data no calendário'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
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
        </button>
      </div>

      {aberto && !desabilitado && (
        <div className="datepicker-popover" role="dialog" aria-label="Seletor de Data">
          {/* Cabeçalho com navegação rápida de mês e ano */}
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-btn-nav"
              onClick={() => handleMudarMes(-1)}
              aria-label="Mês anterior"
            >
              ‹
            </button>

            <div className="datepicker-seletores">
              <select
                className="datepicker-select-mes"
                value={mesVisivel}
                onChange={(e) => setMesVisivel(parseInt(e.target.value, 10))}
                aria-label="Mês"
              >
                {MESES.map((nomeMes, idx) => (
                  <option key={nomeMes} value={idx}>
                    {nomeMes}
                  </option>
                ))}
              </select>

              <select
                className="datepicker-select-ano"
                value={anoVisivel}
                onChange={(e) => setAnoVisivel(parseInt(e.target.value, 10))}
                aria-label="Ano"
              >
                {anosDisponiveis.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="datepicker-btn-nav"
              onClick={() => handleMudarMes(1)}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="datepicker-dias-semana">
            {DIAS_SEMANA.map((diaSem) => (
              <span key={diaSem} className="datepicker-dia-semana-label">
                {diaSem}
              </span>
            ))}
          </div>

          {/* Grade de dias do mês */}
          <div className="datepicker-grade-dias">
            {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
              <span key={`vazio-${i}`} className="datepicker-celula-vazia" />
            ))}

            {Array.from({ length: totalDiasMes }, (_, i) => i + 1).map((dia) => {
              const selecionado = ehDiaSelecionado(dia);
              const futuro = ehDiaFuturo(dia);
              const hojeDia = ehDiaHoje(dia);

              return (
                <button
                  key={dia}
                  type="button"
                  disabled={futuro}
                  className={`datepicker-btn-dia ${selecionado ? 'selecionado' : ''} ${
                    hojeDia ? 'hoje' : ''
                  } ${futuro ? 'desabilitado' : ''}`}
                  onClick={() => handleSelecionarDia(dia)}
                >
                  {dia}
                </button>
              );
            })}
          </div>

          {/* Rodapé com botões de atalho */}
          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-btn-atalho"
              onClick={() => {
                const hojeDia = hoje.getDate();
                const hojeMes = hoje.getMonth();
                const hojeAno = hoje.getFullYear();
                setMesVisivel(hojeMes);
                setAnoVisivel(hojeAno);
                handleSelecionarDia(hojeDia);
              }}
            >
              Hoje
            </button>
            <button
              type="button"
              className="datepicker-btn-atalho fechar"
              onClick={() => setAberto(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
