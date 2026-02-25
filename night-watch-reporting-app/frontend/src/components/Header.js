import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ padding: 12, borderBottom: '1px solid #ddd', marginBottom: 12 }}>
      <nav>
        <Link to="/">Accueil</Link> |{' '}
        <Link to="/reports">Rapports</Link> |{' '}
        <Link to="/planning">Planning</Link> |{' '}
        <Link to="/history">Historique</Link> |{' '}
        <Link to="/admin">Administration</Link> |{' '}
        <Link to="/rgpd">RGPD</Link>
      </nav>
    </header>
  );
};

export default Header;
