import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/presleylogo-removebg-preview.png';
import './SalesDetails.css';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  total: number;
  note?: string;
  Product: Product;
}

interface Order {
  id: number;
  tableNumber: string | number;
  OrderItems: OrderItem[];
}

const SalesDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Buscar comanda pelo backend
  useEffect(() => {
  if (!orderId) return;

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Erro ao buscar comanda:', err);
      setError('Comanda não encontrada');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  fetchOrder();
}, [orderId]);


  // Calcula total da comanda
  const orderTotal = order?.OrderItems.reduce((sum, i) => sum + i.total, 0) ?? 0;

  // Remove item do pedido
  const handleRemoveItem = async (itemId: number) => {
    if (!order) return;

    try {
      await axios.delete(`http://localhost:5000/orders/${order.id}/items/${itemId}`);
      const updatedItems = order.OrderItems.filter((i) => i.id !== itemId);
      setOrder({ ...order, OrderItems: updatedItems });
    } catch (err) {
      console.error('Erro ao remover item:', err);
      alert('Erro ao remover item. Tente novamente.');
    }
  };

  // Abrir caixa de pagamento
  const handleOpenPayment = () => {
    setPaymentMethod('');
    setShowPaymentBox(true);
  };

  // Fechar conta
  const handleConfirmCloseBill = async () => {
    if (!order) return;
    if (!paymentMethod) {
      alert('Selecione o método de pagamento antes de fechar a conta.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/orders/${order.id}/close`, { paymentMethod });
      alert(`Conta da Mesa ${order.tableNumber} fechada com sucesso!`);
      navigate('/comandas');
    } catch (err) {
      console.error(err);
      alert('Erro ao fechar conta. Tente novamente.');
    } finally {
      setSubmitting(false);
      setShowPaymentBox(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  if (error || !order) {
    return (
      <div className="sales-details-container">
        <Link to="/comandas">
          <img src={logo} alt="Logo" className="sales-logo" />
        </Link>
        <p className="no-order">{error || 'Comanda não encontrada'}</p>
      </div>
    );
  }

  return (
    <div className="sales-details-container">
      <Link to="/comandas">
        <img src={logo} alt="Logo" className="sales-logo" />
      </Link>

      <h2 className="centered-title">Comanda {order.tableNumber}</h2>

      <ul className="order-items">
        {order.OrderItems.map((item) => (
          <li key={item.id} className="order-item">
            <div>
              <strong>{item.Product.name}</strong> <span>({item.quantity}x)</span>
              {item.note && <p className="item-note">Obs: {item.note}</p>}
            </div>
            <div className="item-right">
              <span>R$ {item.total.toFixed(2)}</span>
              <button
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remover item
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="order-total">
        Total: <strong>R$ {orderTotal.toFixed(2)}</strong>
      </div>

      <div className="actions-row">
        <Link to="/comandas" className="back-button">Voltar</Link>

        {!showPaymentBox && (
          <button className="close-bill" onClick={handleOpenPayment}>
            Fechar Conta
          </button>
        )}
      </div>

      {showPaymentBox && (
        <div className="payment-area">
          <h3>Finalizar Pagamento</h3>
          <label>
            Método de Pagamento:
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="débito">Débito</option>
              <option value="crédito">Crédito</option>
              <option value="pix">PIX</option>
            </select>
          </label>
          <button
            onClick={handleConfirmCloseBill}
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Confirmar Fechamento'}
          </button>
          <button
            onClick={() => setShowPaymentBox(false)}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesDetails;
