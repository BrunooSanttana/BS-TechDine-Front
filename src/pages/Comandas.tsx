import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Comandas.css';
import axios from 'axios';

// Interface mínima para comandas
interface Order {
  id: number;
  tableNumber: string | number;
}

const Comandas: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get<Order[]>('http://localhost:5000/orders');
      const simplifiedOrders = res.data.map(order => ({
        id: order.id,
        tableNumber: order.tableNumber
      }));
      setOrders(simplifiedOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Opcional: atualiza a lista a cada 5 segundos
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNewSale = () => navigate('/sales');
  const handleMakeOrder = (tableNumber: string | number) => navigate(`/sales/${tableNumber}`);
  const handleViewDetails = (orderId: number) => navigate(`/sales-details/${orderId}`);

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
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3 className="order-header">Mesa {order.tableNumber}</h3>
              <div className="order-actions">
                <button className="btn-pedido" onClick={() => handleMakeOrder(order.tableNumber)}>
                  ➕ Fazer Pedido
                </button>
                <button className="btn-detalhes" onClick={() => handleViewDetails(order.id)}>
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
