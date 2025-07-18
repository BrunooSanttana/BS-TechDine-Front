import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/presleylogo.png';
import './Comandas.css'; // Importa o CSS

const Comandas = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Recupera os pedidos do Local Storage
  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleOrderClick = (tableNumber) => {
    navigate(`/sales/${tableNumber}`);
  };

  return (
    <div className="container"> {/* Adiciona a classe container */}
      <div>
        <Link to="/Menu">
          <img src={logo} alt="Logo" className="logo" /> {/* Adiciona a classe logo */}
        </Link>
        <h2>Comandas em Aberto</h2>
      </div>
      {orders.length === 0 ? (
        <p>Nenhuma comanda em aberto.</p>
      ) : (
        <ul className="orders-list"> {/* Adiciona a classe orders-list */}
          {orders.map((order, index) => (
            <li key={index} onClick={() => handleOrderClick(order.tableNumber)}>
              {order.tableNumber}
            </li>
          ))}
        </ul>
      )}
      <Link to="/sales" className="start-sale">Iniciar Nova Venda</Link> {/* Adiciona a classe start-sale */}
    </div>
  );
};

export default Comandas;
