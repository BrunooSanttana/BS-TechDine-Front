import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo.png';
import './Faturamento.css'; // Importa o CSS

const Faturamento = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchFaturamento = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione o período.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/faturamento?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Erro na rede: ' + response.statusText);
      const data = await response.json();
      setTotalAmount(data.total);
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
    }
  };

  return (
    <div className="faturamento-container">
      <Link to="/Menu">
        <img src={logo} alt="Logo" className="faturamento-logo" />
      </Link>

      <h2 className="faturamento-title">Faturamento</h2>

      <div>
        <label className="faturamento-label">
          Data de Início:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label className="faturamento-label">
          Data de Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <button onClick={fetchFaturamento} className="faturamento-button">Buscar Faturamento</button>

      <h3 className="faturamento-total">Total Faturado no Período: R${totalAmount.toFixed(2)}</h3>
    </div>
  );
};

export default Faturamento;
