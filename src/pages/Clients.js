import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importando Link
import logo from '../images/presleylogo.png';


const Clients = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [clients, setClients] = useState([]);
  const [successMessage, setSuccessMessage] = useState(''); // Estado para a mensagem de sucesso


  const handleClientSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, cpf, phone }),
      });

      if (response.ok) {
        const newClient = await response.json();
        setClients([...clients, newClient]);
        setName('');
        setCpf('');
        setPhone('');
        setSuccessMessage('Cliente cadastrado com sucesso!'); // Mensagem de sucesso
        
         // Limpa a mensagem após 3 segundos
         setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Erro ao cadastrar cliente');
        setSuccessMessage(''); // Limpar a mensagem se houver erro
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor', error);
      setSuccessMessage(''); // Limpar a mensagem se houver erro
    }
  };

  return (
    <div>
       {/* Logo como link para o Menu */}
       <Link to="/Menu">
        <img src={logo} alt="Logo"  style={{ cursor: 'pointer', width: '100px', marginBottom: '20px' }} />
      </Link>
      <h2 className="centered-title">Cadastrar Cliente</h2>
      <form onSubmit={handleClientSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          CPF:
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Telefone:
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Cadastrar Cliente</button>
      </form>
      {successMessage && <div className="success-message">{successMessage}</div>} {/* Exibir a mensagem de sucesso */}
    </div>
  );
};

export default Clients;
