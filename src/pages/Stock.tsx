import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/presleylogo-removebg-preview.png';
import './Stock.css';

interface ProductStock {
  id: number;
  name: string;
  stock: number;
}

const Stock: React.FC = () => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);

  // 🔹 carregar estoque
  const loadStock = async () => {
    const res = await axios.get<ProductStock[]>('http://localhost:5000/stock');
    setProducts(res.data);
  };

  useEffect(() => {
    loadStock();
  }, []);

  // 🔹 adicionar ao estoque
  const handleAddStock = async () => {
    if (!selectedId || quantity <= 0) {
      alert('Selecione um produto e informe a quantidade');
      return;
    }

    const product = products.find(p => p.id === selectedId);
    if (!product) return;

    const newStock = product.stock + quantity;

    await axios.put(`http://localhost:5000/stock/${selectedId}`, {
      stock: newStock
    });

    setShowModal(false);
    setSelectedId('');
    setQuantity(0);
    loadStock();
  };

  return (
    <div className="stock-container">

      {/* Logo */}
      <Link to="/home" className="logo-wrapper">
        <img src={logo} alt="Logo Presley" className="menu-logo" />
      </Link>

      <h2 className="stock-title">Controle de Estoque</h2>

      {/* Botão */}
      <button className="btn-add-stock" onClick={() => setShowModal(true)}>
        + Adicionar produto ao Estoque
      </button>

      {/* Tabela */}
      <table className="stock-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>
                {/* quantidade numérica */}
                <span className={p.stock === 0 ? 'zero-stock-number' : ''}>
                  {p.stock}
                </span>

                {/* barra */}
                <div
                  className={`stock-bar ${p.stock === 0 ? 'zero-stock-bar' :
                      p.stock <= 5 ? 'low-stock-bar' : ''
                    }`}
                  style={{
                    width: p.stock === 0 ? '30px' : `${Math.min(p.stock, 20) * 5}%`
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Adicionar Produto no Estoque</h3>

            <select
              value={selectedId}
              onChange={e => setSelectedId(Number(e.target.value))}
            >
              <option value="">Selecione um produto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantidade"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />

            <div className="modal-actions">
              <button onClick={handleAddStock}>Salvar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Stock;
