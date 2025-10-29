import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Faturamento.css';


// Interface para definir a estrutura da resposta da API
interface FaturamentoResponse {
  total: number;
  // Adicione outras propriedades conforme necessário
  // Por exemplo: sales, period, etc.
}

const Faturamento: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const fetchFaturamento = async (): Promise<void> => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione o período.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/faturamento?startDate=${startDate}&endDate=${endDate}`);
      
      if (!response.ok) {
        throw new Error('Erro na rede: ' + response.statusText);
      }
      
      const data: FaturamentoResponse = await response.json();
      setTotalAmount(data.total);
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
      // Opcional: mostrar mensagem de erro para o usuário
      alert('Erro ao buscar faturamento. Tente novamente.');
    }
  };

  return (
     <div className="sales-container">
      <Link to="/Menu">
      <img src={logo} alt="Logo" className="sales-logo" />
      </Link>
      <h2 className="centered-title">Faturamento</h2>

      <div>
        <label className="faturamento-label">
          Data de Início:
          <input
            type="date"
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label className="faturamento-label">
          Data de Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <button 
        onClick={fetchFaturamento} 
        className="faturamento-button"
        type="button"
      >
        Buscar Faturamento
      </button>

      <h3 className="faturamento-total">
        Total Faturado no Período: R${totalAmount.toFixed(2)}
      </h3>
    </div>
  );
};

export default Faturamento; 