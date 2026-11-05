import { useEffect, useState } from 'react';
import { faqData } from '../data/faqData';
import '../styles/ajuda.css';

const CHAVE_FEEDBACK_FAQ = 'db_cantina_faq_feedback';

// Retorna a data local de hoje no formato YYYY-MM-DD
function obterDataLocalHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function obterHistoricoFeedbackFaq() {
  try {
    const bruto = localStorage.getItem(CHAVE_FEEDBACK_FAQ);
    if (!bruto) return [];
    const parseado = JSON.parse(bruto);
    return Array.isArray(parseado) ? parseado : [];
  } catch {
    return [];
  }
}

function buscarVotoHojeUsuario(usuarioLogado) {
  if (!usuarioLogado) return null;
  const hoje = obterDataLocalHoje();
  const historico = obterHistoricoFeedbackFaq();
  const registro = historico.find(
    (item) =>
      item.usuario &&
      item.usuario.toLowerCase() === usuarioLogado.toLowerCase() &&
      item.data === hoje
  );
  return registro ? registro.voto : null; // 'sim' | 'nao' | null
}

function Ajuda({ usuarioLogado }) {
  const [idAberto, setIdAberto] = useState(null);
  const [votoHoje, setVotoHoje] = useState(() =>
    buscarVotoHojeUsuario(usuarioLogado)
  );

  // Atualiza caso o usuário faça login/logout
  useEffect(() => {
    setVotoHoje(buscarVotoHojeUsuario(usuarioLogado));
  }, [usuarioLogado]);

  const alternarPergunta = (id) => {
    setIdAberto((prev) => (prev === id ? null : id));
  };

  const registrarFeedbackDia = (votoEscolhido) => {
    if (!usuarioLogado || votoHoje) return;

    const hoje = obterDataLocalHoje();
    const historico = obterHistoricoFeedbackFaq();

    const novoRegistro = {
      usuario: usuarioLogado,
      data: hoje,
      voto: votoEscolhido, // 'sim' | 'nao'
      foiUtil: votoEscolhido === 'sim',
      registradoEm: new Date().toISOString(),
    };

    const historicoAtualizado = [
      ...historico.filter(
        (item) =>
          !(
            item.usuario &&
            item.usuario.toLowerCase() === usuarioLogado.toLowerCase() &&
            item.data === hoje
          )
      ),
      novoRegistro,
    ];

    localStorage.setItem(CHAVE_FEEDBACK_FAQ, JSON.stringify(historicoAtualizado));
    setVotoHoje(votoEscolhido);

    // Sincroniza também com o banco SQLite via API Flask (se online)
    fetch('http://localhost:5000/api/avaliacao-faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuarioLogado,
        data: hoje,
        foi_util: votoEscolhido === 'sim',
      }),
    }).catch(() => {});
  };

  return (
    <main className="conteudo-principal ajuda-main">
      <div className="cabecalho-pagina">
        <div className="titulo-cabecalho-ajuda">
          <span className="icone-titulo-ajuda" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <h2>Perguntas Frequentes</h2>
        </div>
        <p>Tire suas dúvidas sobre pedidos, pagamentos e retiradas.</p>
      </div>

      <div className="faq-container">
        {faqData.map((item) => {
          const estaAberto = idAberto === item.id;
          return (
            <div key={item.id} className={`faq-item ${estaAberto ? 'ativo' : ''}`}>
              <button
                type="button"
                className="faq-pergunta"
                onClick={() => alternarPergunta(item.id)}
              >
                {item.pergunta}
                <span className="icone-seta">▼</span>
              </button>
              <div className="faq-resposta-wrapper">
                <div className="faq-resposta">
                  <p>{item.resposta}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avaliação diária de utilidade do FAQ (Exibida apenas para usuários logados, 1x por dia) */}
      {usuarioLogado && (
        <section className="bloco-avaliacao-faq" aria-live="polite">
          {!votoHoje ? (
            <div className="conteudo-avaliacao-faq">
              <span className="pergunta-avaliacao-faq">
                Essas dúvidas foram úteis hoje?
              </span>
              <div className="botoes-avaliacao-faq">
                <button
                  type="button"
                  className="btn-voto-faq sim"
                  onClick={() => registrarFeedbackDia('sim')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 10v12" />
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                  </svg>
                  <span>Sim</span>
                </button>
                <button
                  type="button"
                  className="btn-voto-faq nao"
                  onClick={() => registrarFeedbackDia('nao')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 14V2" />
                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                  </svg>
                  <span>Não</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="agradecimento-avaliacao-faq">
              <span className="icone-check-faq">✓</span>
              <span>
                Obrigado pelo seu feedback de hoje, <strong>{usuarioLogado}</strong>!
              </span>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Ajuda;
