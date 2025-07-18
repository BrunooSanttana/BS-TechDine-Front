import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Cria o objeto com os dados do usuário
    const user = {
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
        const data = await response.json();
        console.log('Usuário cadastrado:', data);
        setSuccessMessage('Cadastro efetuado com sucesso!');
        setTimeout(() => {
          navigate('/'); // Redireciona para a página inicial
        }, 2000); // Tempo de espera para a mensagem de sucesso
      } else {
        console.error('Erro ao cadastrar o usuário');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
    }
  };

  return (
    <div>
      <h2 className="centered-title">Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
