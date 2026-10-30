import { estatisticasData, equipeData } from '../data/equipeData';
import '../styles/sobre.css';

function Sobre() {
  return (
    <main className="conteudo-principal sobre-main">
      <section className="sobre-introducao">
        <div className="texto-intro">
          <h2>Inovação e sabor para a nossa comunidade acadêmica</h2>
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
