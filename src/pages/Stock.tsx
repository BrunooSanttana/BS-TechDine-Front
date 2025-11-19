import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Stock.css';

const Stock: React.FC = () => {
  return (
    <div className="stock-container">
      {/* Logo centralizado com link para /home */}
      <Link to="/home" className="logo-wrapper" style={{ display: 'block', textAlign: 'center', marginBottom: '20px' }}>
        <img src={logo} alt="Logo Presley" className="menu-logo" style={{ maxWidth: '200px' }} />
      </Link>

      {/* Título */}
      <h2 className="stock-title">Controle de Estoque</h2>
    </div>
  );
};

export default Stock;
