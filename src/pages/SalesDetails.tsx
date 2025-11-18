import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './SalesDetails.css';

interface OrderItem {
  productName: string;
  quantity: number;
  price?: number;
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

  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Carrega comanda do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('salesOrders');
      if (!saved) return setOrder(null);
      const orders: Order[] = JSON.parse(saved);
      const current = orders.find((o) => String(o.tableNumber) === String(tableNumber));
      setOrder(current || null);
    } catch (err) {
      console.error('Erro ao ler salesOrders:', err);
      setOrder(null);
    }
  }, [tableNumber]);

  // Remove 1 unidade do item — se quantity === 1 remove o item
  const handleRemoveItem = (index: number) => {
    if (!order) return;

    const updatedItems = order.items
      .map((item, i) => {
        if (i !== index) return item;

        if (item.quantity > 1) {
          const unitPrice = item.total / item.quantity;
          return {
            ...item,
            quantity: item.quantity - 1,
            total: Number((item.total - unitPrice).toFixed(2)),
          };
        }

        // quantity === 1 => remove
        return null;
      })
      .filter((it): it is OrderItem => it !== null);

    const updatedOrder: Order = { ...order, items: updatedItems };

    // atualiza state e localStorage
    setOrder(updatedOrder);
    try {
      const saved = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const newOrders = saved.map((o: Order) =>
        String(o.tableNumber) === String(order.tableNumber) ? updatedOrder : o
      );
      localStorage.setItem('salesOrders', JSON.stringify(newOrders));
    } catch (err) {
      console.error('Erro ao atualizar localStorage ao remover item:', err);
    }
  };

  // Função para confirmar fechamento — envia para backend e remove do localStorage
  const handleConfirmCloseBill = async () => {
    if (!order) return;

    if (!paymentMethod) {
      setPaymentError('Selecione o método de pagamento antes de fechar a conta.');
      return;
    }
    setPaymentError('');
    setSubmitting(true);

    try {
      // envia para backend (rota /orders espera items e calcula total no servidor)
      const resp = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: order.tableNumber,
          paymentMethod,
          items: order.items,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Servidor retornou ${resp.status} ${txt}`);
      }

      // remove do localStorage só após sucesso
      const saved = JSON.parse(localStorage.getItem('salesOrders') || '[]') as Order[];
      const remaining = saved.filter((o) => String(o.tableNumber) !== String(order.tableNumber));
      localStorage.setItem('salesOrders', JSON.stringify(remaining));

      // navega e notifica (alert opcional)
      // alert(`Conta da Mesa ${order.tableNumber} fechada com sucesso!`);
      navigate('/comandas');
    } catch (error) {
      console.error('Erro ao fechar conta:', error);
      setPaymentError('Erro ao salvar no servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
      setShowPaymentBox(false);
    }
  };

  // Abre a caixa de pagamento e limpa mensagem
  const handleOpenPayment = () => {
    setPaymentError('');
    setShowPaymentBox(true);
  };

  if (!order) {
    return (
      <div className="sales-details-container">
        <Link to="/comandas">
          <img src={logo} alt="Logo" className="sales-logo" />
        </Link>
        <p className="no-order">Comanda não encontrada.</p>
      </div>
    );
  }

  const orderTotal = order.items.reduce((sum, it) => sum + it.total, 0).toFixed(2);

  return (
    <div className="sales-details-container">
      <Link to="/comandas" className="logo-link">
        <img src={logo} alt="Logo" className="sales-logo" />
      </Link>

      <h2 className="centered-title">Comanda {order.tableNumber}</h2>

      <div className="order-details">
        <ul className="order-items">
          {order.items.map((item, idx) => (
            <li key={idx} className="order-item">
              <div>
                <strong>{item.productName}</strong> <span className="qty">({item.quantity}x)</span>
                {item.note && <p className="item-note">Obs: {item.note}</p>}
              </div>

              <div className="item-right">
                <span className="item-total">R$ {item.total.toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(idx)}
                  aria-label={`Remover uma unidade de ${item.productName}`}
                >
                  Remover item
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="order-total">
          Total: <strong>R$ {orderTotal}</strong>
        </div>
      </div>

      {/* ações: Voltar sempre visível */}
      <div className="actions-row">
        <Link to="/comandas" className="back-button">
          Voltar
        </Link>

        {/* botão Fechar Conta — só aparece quando a caixa não está aberta */}
        {!showPaymentBox && (
          <button className="close-bill" onClick={handleOpenPayment}>
            Fechar Conta
          </button>
        )}
      </div>

      {/* área de pagamento expandida */}
      {showPaymentBox && (
        <div className="payment-area" role="region" aria-label="Pagamento">
          <h3>Finalizar Pagamento</h3>

          <label className="payment-label">
            Método de Pagamento:
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-select"
              aria-label="Selecione o método de pagamento"
            >
              <option value="">Selecione</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="débito">Débito</option>
              <option value="crédito">Crédito</option>
              <option value="pix">PIX</option>
            </select>
          </label>

          <button
            className="confirm-bill"
            onClick={handleConfirmCloseBill}
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Confirmar Fechamento'}
          </button>

          <button
            className="cancel-payment"
            onClick={() => {
              setShowPaymentBox(false);
              setPaymentError('');
            }}
            disabled={submitting}
          >
            Cancelar
          </button>

          {/* erro inline em vermelho */}
          {paymentError && <p className="payment-error">{paymentError}</p>}
        </div>
      )}
    </div>
  );
};

export default SalesDetails;
