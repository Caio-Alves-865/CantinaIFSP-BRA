import { estatisticasData, equipeData } from '../data/equipeData';
import '../styles/sobre.css';

function Sobre() {
  return (
    <main className="conteudo-principal sobre-main">
      <section className="sobre-introducao">
        <div className="texto-intro">
          <div className="cabecalho-titulo-sobre">
            <div className="icone-titulo-sobre" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h2>Inovação e sabor para a nossa comunidade acadêmica</h2>
          </div>
          <p>
            A plataforma digital da <strong>Cantina Serra e Soares</strong> nasceu de
            um projeto de extensão universitária focado em modernizar e agilizar o
            atendimento durante os intervalos do campus. Nossa missão é reduzir filas,
            otimizar o tempo dos alunos e oferecer uma experiência prática e acolhedora.
          </p>
          <p>
            Desenvolvido com tecnologias modernas, o sistema garante que cada pedido
            chegue fresquinho e na hora certa, unindo boa comida e bons momentos no dia a
            dia escolar.
          </p>
        </div>
        <div className="imagem-intro">
          <img src="/img/logos/logo_cantina.png" alt="Cantina Serra e Soares" />
        </div>
      </section>

      <section className="sobre-dados">
        {estatisticasData.map((dado) => (
          <div key={dado.id} className="card-dado">
            <span className="numero-dado">{dado.numero}</span>
            <span className="legenda-dado">{dado.legenda}</span>
          </div>
        ))}
      </section>

      <section className="sobre-equipe">
        <h3>Desenvolvido por</h3>
        <p className="subtitulo-equipe">
          Alunos de Análise e Desenvolvimento de Sistemas (ADS) - IFSP
        </p>

        <div className="grade-equipe">
          {equipeData.map((membro) => (
            <div key={membro.id} className="card-membro">
              <div className="foto-membro">
                <img src={membro.foto} alt={membro.nome} />
              </div>
              <h4>{membro.nome}</h4>
              <p>{membro.cargo}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Sobre;
