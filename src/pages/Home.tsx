import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">PRESLEY PUB</h1>
        <img src={logo} alt="Logo" className="home-logo" />
        <nav className="home-nav">
          <Link to="/login" className="home-btn primary-btn">Login</Link>
          <Link to="/register" className="home-btn secondary-btn">Novo por aqui? Cadastre-se!</Link>
        </nav>
      </div>
    </div>
  );
};

export default Home; 