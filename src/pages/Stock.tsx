import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/presleylogo-removebg-preview.png';
import './Stock.css';

interface ProductStock {
  id: number;
  name: string;
  stock: number;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

const Stock: React.FC = () => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  // Carregar estoque
  const loadStock = async (categoryId?: number) => {
    let url = 'http://localhost:5000/stock';
    if (categoryId) url += `?categoryId=${categoryId}`;
    const res = await axios.get<ProductStock[]>(url);
    setProducts(res.data);
  };

  // Carregar categorias
  const loadCategories = async () => {
    const res = await axios.get<Category[]>('http://localhost:5000/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    loadStock();
    loadCategories();
  }, []);

  // Adicionar ao estoque
  const handleAddStock = async () => {
    if (!selectedId || quantity <= 0) {
      alert('Selecione um produto e informe a quantidade');
      return;
    }

    const product = products.find(p => p.id === selectedId);
    if (!product) return;

    const newStock = product.stock + quantity;

    await axios.put(`http://localhost:5000/stock/${selectedId}`, { stock: newStock });

    setShowModal(false);
    setSelectedId('');
    setQuantity(0);
    setSelectedCategoryId('');
    if (selectedCategory === 'all') loadStock();
    else loadStock(selectedCategory);
  };

  return (
    <div className="stock-container">
      <Link to="/home" className="logo-wrapper">
        <img src={logo} alt="Logo Presley" className="menu-logo" />
      </Link>

      <h2 className="stock-title">Controle de Estoque</h2>

      {/* Filtro da tabela */}
      <div className="stock-filters">
        <select
          value={selectedCategory}
          onChange={(e) => {
            const value = e.target.value === 'all' ? 'all' : Number(e.target.value);
            setSelectedCategory(value);
            if (value === 'all') loadStock();
            else loadStock(value);
          }}
        >
          <option value="all">Filtre por categoria</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Botão abrir modal */}
      <button className="btn-add-stock" onClick={() => setShowModal(true)}>
        + Adicionar produto ao Estoque
      </button>

      {/* Tabela de estoque */}
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
                <span className={p.stock === 0 ? 'zero-stock-number' : ''}>{p.stock}</span>
                <div
                  className={`stock-bar ${p.stock === 0 ? 'zero-stock-bar' : p.stock <= 5 ? 'low-stock-bar' : ''}`}
                  style={{ width: p.stock === 0 ? '30px' : `${Math.min(p.stock, 20) * 5}%` }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de adicionar estoque */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Adicionar Produto no Estoque</h3>

            {/* Categoria */}
            <label>
              Categoria:
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(Number(e.target.value));
                  setSelectedId('');
                }}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            {/* Produto filtrado */}
            <label>
              Produto:
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                disabled={!selectedCategoryId}
              >
                <option value="">Selecione um produto</option>
                {products
                  .filter(p => p.categoryId === selectedCategoryId)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Estoque: {p.stock})
                    </option>
                  ))}
              </select>
            </label>

            {/* Quantidade */}
            <label>
              Quantidade:
              <input
                type="number"
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>

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
