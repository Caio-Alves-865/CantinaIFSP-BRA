import { Link } from 'react-router-dom';

function Footer({ mostrarLinksUteis = true }) {
  return (
    <footer className="cantina-footer">
      <p>&copy; 2026 Sistema de Gestão da Cantina. Desenvolvido para a comunidade escolar.</p>
      {mostrarLinksUteis && (
        <div className="links-uteis">
          <Link to="/sobre">Sobre</Link>
          <Link to="/ajuda">Ajuda / FAQ</Link>
        </div>
      )}
    </footer>
  );
}

export default Footer;
