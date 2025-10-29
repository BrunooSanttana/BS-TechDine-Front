import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';

// Interface para definir a estrutura de um cliente
interface Client {
  id?: number;
  name: string;
  cpf: string;
  phone: string;
}

// Interface para a resposta da API
interface ApiResponse {
  id: number;
  name: string;
  cpf: string;
  phone: string;
}

const Clients: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleClientSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
        const newClient: ApiResponse = await response.json();
        setClients([...clients, newClient]);
        setName('');
        setCpf('');
        setPhone('');
        setSuccessMessage('Cliente cadastrado com sucesso!'); 
        
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
  <div className="sales-container">
      <Link to="/Menu">
      <img src={logo} alt="Logo" className="sales-logo" />
      </Link>
      <h2 className="centered-title">Cadastrar Cliente</h2>
      <form onSubmit={handleClientSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          CPF:
          <input
            type="text"
            value={cpf}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpf(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Telefone:
          <input
            type="text"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Cadastrar Cliente</button>
      </form>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default Clients; 