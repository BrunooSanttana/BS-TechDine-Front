import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo.png';

const Home = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  };

  const logoStyle = {
    height: '200px',
    marginBottom: '50px'
  };

  const titleStyle = {
    fontSize: '4rem',
    color: '#000000',
    marginBottom: '20px'
  };

  const navStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const linkStyleLogin = {
    backgroundColor: '#1C1C1C',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1.1rem',
  };

  const linkStyleRegister = {
    color: '#000000',
    padding: '10px 40px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1.1rem',

  };


  const linkHoverStyle = {
    backgroundColor: '#4F4F4F'
   };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>PRESLEY  PUB</h1>
      <img src={logo} alt="Logo" style={logoStyle} />
      <nav style={navStyle}>
        <Link to="/login" style={linkStyleLogin} onMouseOver={(e) => e.currentTarget.style.backgroundColor = linkHoverStyle.backgroundColor} onMouseOut={(e) => e.currentTarget.style.backgroundColor = linkStyleLogin.backgroundColor}>Login</Link>
        <br></br>
        <Link to="/register" style={linkStyleRegister} onMouseOut={(e) => e.currentTarget.style.backgroundColor = linkStyleRegister.backgroundColor}>Novo por aqui ? Cadastre-se!</Link>
      </nav>
    </div>
  );
};

export default Home;