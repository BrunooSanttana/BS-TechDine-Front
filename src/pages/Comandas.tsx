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

  const handleNewSale = (): void => {
    navigate('/sales');
  };

  const handleMakeOrder = (tableNumber: string | number): void => {
    navigate(`/sales/${tableNumber}`);
  };

  const handleViewDetails = (tableNumber: string | number): void => {
    navigate(`/sales-details/${tableNumber}`);
  };

  return (
    <div className="comandas">
      <Link to="/menu">
        <img src={logo} alt="Logo" className="comandas-logo" />
      </Link>
      <h2 className="centered-title">Comandas em Aberto</h2>

      {orders.length === 0 ? (
        <p className="no-orders">Nenhuma comanda em aberto.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order: Order, index: number) => (
            <div key={index} className="order-card">
              <h3 className="order-header">Mesa {order.tableNumber}</h3>
              <div className="order-actions">
                <button
                  className="btn-pedido"
                  onClick={() => handleMakeOrder(order.tableNumber)}
                >
                  ➕ Fazer Pedido
                </button>
                <button
                  className="btn-detalhes"
                  onClick={() => handleViewDetails(order.tableNumber)}
                >
                  📋 Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleNewSale} className="start-sale">
        Iniciar Nova Venda
      </button>
    </div>
  );
};

export default Comandas;
