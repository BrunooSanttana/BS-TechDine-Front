import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../images/presleylogo-removebg-preview.png';

// Interface para definir a estrutura da resposta da API
interface LoginResponse {
  message?: string;
  error?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Exibe a mensagem de sucesso no console do navegador
        console.log(data.message);

        // Login bem-sucedido, redireciona para a tela inicial
        navigate('/Menu');
      } else {
        setError(data.error || 'Erro no login'); // Exibe a mensagem de erro do backend
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
      setError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <div></div>
      <h2 className="centered-title">Login</h2>
      <div className="form-backgroud">
        <form className="login" onSubmit={handleSubmit}>
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
          <button type="submit">Entrar</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login; 