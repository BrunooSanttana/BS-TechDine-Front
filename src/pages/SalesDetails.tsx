import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './SalesDetails.css';

interface OrderItem {
  productName: string;
  quantity: number;
  total: number;
  note?: string;
}

interface Order {
  tableNumber: string | number;
  items: OrderItem[];
}

const SalesDetails: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      const orders: Order[] = JSON.parse(savedOrders);
      const currentOrder = orders.find(o => o.tableNumber === tableNumber);
      setOrder(currentOrder || null);
    }
  }, [tableNumber]);

  if (!order) {
    return (
      <div className="sales-details-container">
        <Link to="/comandas">
          <img src={logo} alt="Logo" className="sales-logo" />
        </Link>
        <p>Comanda não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="sales-details-container">
      <Link to="/comandas">
        <img src={logo} alt="Logo" className="sales-logo" />
      </Link>

      <h2 className="centered-title">Comanda {order.tableNumber}</h2>

      <div className="order-details">
        <ul className="order-items">
          {order.items.map((item, index) => (
            <li key={index} className="order-item">
              <div>
                <strong>{item.productName}</strong> ({item.quantity}x)
                {item.note && <p className="item-note">Obs: {item.note}</p>}
              </div>
              <span className="item-total">R$ {item.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="order-total">
          Total: R${' '}
          {order.items
            .reduce((sum, item) => sum + item.total, 0)
            .toFixed(2)}
        </div>
      </div>

      <Link to="/comandas" className="back-button">Voltar</Link>
    </div>
  );
};

export default SalesDetails;
