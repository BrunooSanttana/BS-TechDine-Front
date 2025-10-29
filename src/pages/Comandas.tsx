import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Comandas.css';

// Interface para definir a estrutura de um pedido
interface Order {
  tableNumber: string | number;
}

const Comandas: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  // Recupera os pedidos do Local Storage
  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      try {
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Erro ao fazer parse dos pedidos:', error);
        setOrders([]);
      }
    }
  }, []);

  const handleOrderClick = (tableNumber: string | number): void => {
    navigate(`/sales/${tableNumber}`);
  };

  return (
  <div className="sales-container">
      <Link to="/Menu">
      <img src={logo} alt="Logo" className="sales-logo" />
      </Link>
      <h2 className="centered-title">Faturamento</h2>
      {orders.length === 0 ? (
        <p>Nenhuma comanda em aberto.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order: Order, index: number) => (
            <li 
              key={index} 
              onClick={() => handleOrderClick(order.tableNumber)}
              style={{ cursor: 'pointer' }}
            >
              {order.tableNumber}
            </li>
          ))}
        </ul>
      )}
      <Link to="/sales" className="start-sale">Iniciar Nova Venda</Link>
    </div>
  );
};

export default Comandas; 