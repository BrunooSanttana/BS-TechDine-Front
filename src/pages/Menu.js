import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo.png';
import './Menu.css'; // Certifique-se de importar o CSS

const Menu = () => {
  return (
    <div className="menu-container">
      <img src={logo} alt="Logo" className="menu-logo" />
      <nav>
        <ul className="menu-list">
          <li>
            <Link to="/" className="menu-link">Home</Link>
          </li>
          <li>
            <Link to="/sales" className="menu-link">Vendas</Link>
          </li>
          <li>
            <Link to="/faturamento" className="menu-link">Faturamento</Link>
          </li>
          <li>
            <Link to="/clients" className="menu-link">Clientes</Link>
          </li>
          <li>
            <Link to="/products" className="menu-link">Cadastrar Produtos</Link>
          </li>
          <li>
            <Link to="/comandas" className="menu-link">Comandas</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Menu;
