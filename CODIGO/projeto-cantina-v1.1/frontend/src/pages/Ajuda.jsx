import { useState } from 'react';
import { faqData } from '../data/faqData';
import '../styles/ajuda.css';

function Ajuda() {
  const [idAberto, setIdAberto] = useState(null);

  const alternarPergunta = (id) => {
    setIdAberto((prev) => (prev === id ? null : id));
  };

  return (
    <main className="conteudo-principal ajuda-main">
      <div className="cabecalho-pagina">
        <h2>Perguntas Frequentes</h2>
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
    </main>
  );
}

export default Ajuda;
