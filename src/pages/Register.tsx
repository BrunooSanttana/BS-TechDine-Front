import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import logo from '../images/presleylogo-removebg-preview.png';

// Interface para definir a estrutura do usuário
interface User {
  username: string;
  email: string;
  password: string;
}

// Interface para a resposta da API
interface RegisterResponse {
  message?: string;
  error?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    // Cria o objeto com os dados do usuário
    const user: User = {
      username,
      email,
      password,
    };

    try {
      // Envia a requisição POST para o backend
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      // Verifica se a requisição foi bem-sucedida
      if (response.ok) {
        const data: RegisterResponse = await response.json();
        console.log('Usuário cadastrado:', data);
        setSuccessMessage('Cadastro efetuado com sucesso!');
        setTimeout(() => {
          navigate('/'); // Redireciona para a página inicial
        }, 2000); // Tempo de espera para a mensagem de sucesso
      } else {
        console.error('Erro ao cadastrar o usuário');
        setSuccessMessage('Erro ao cadastrar o usuário.');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
      setSuccessMessage('Erro ao conectar ao servidor.');
    }
  };

  return (
    <div className="register-container">
      <img src={logo} alt="Logo" className="register-logo" />
      <div></div>
      <h2 className="centered-title">Cadastro</h2>
      <div className="form-backgroud"></div>
      <form className="login" onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Cadastrar</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Register; 