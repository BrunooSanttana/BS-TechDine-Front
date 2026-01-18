import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/presleylogo-removebg-preview.png';
import printJS from 'print-js';
import './Sales.css';

// Interfaces
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  stock: number;
}

interface OrderItem {
  category: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  note?: string;
}

const Sales: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedProductPrice, setSelectedProductPrice] = useState<number>(0);
  const [selectedProductStock, setSelectedProductStock] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { tableNumber: tableFromParams } = useParams<{ tableNumber: string }>();

  // Receber mesa do Comandas
  useEffect(() => {
    if (tableFromParams) setTableNumber(tableFromParams);
    if (location.state && location.state.tableNumber) setTableNumber(location.state.tableNumber);
  }, [location.state, tableFromParams]);

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/categories');
        setCategories(res.data);
      } catch (e) {
        console.error('Erro ao buscar categorias:', e);
      }
    };
    fetchCategories();
  }, []);

  // Buscar produtos da categoria
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/categories/${selectedCategory}/products`);
        setProducts(res.data);
      } catch (e) {
        console.error('Erro ao buscar produtos:', e);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Atualizar produto selecionado
  useEffect(() => {
    const product = products.find(p => p.id === Number(selectedProduct));
    if (product) {
      setSelectedProductName(product.name);
      setSelectedProductPrice(product.price);
      setSelectedProductStock(product.stock);
    } else {
      setSelectedProductName('');
      setSelectedProductPrice(0);
      setSelectedProductStock(0);
    }
  }, [selectedProduct, products]);

  // Adicionar item ao pedido (envia ao backend)
  const handleAddItem = async () => {

    if (!tableNumber) return alert('Informe o número da mesa ou cliente.');
    if (!selectedCategory || !selectedProduct) return alert('Selecione categoria e produto.');
    if (quantity > selectedProductStock) return alert('Estoque insuficiente para este produto.');

    const itemTotal = selectedProductPrice * quantity;

    try {
      // Envia para o backend
      await axios.post('http://localhost:5000/orders', {
        tableNumber,
        paymentMethod: 'dinheiro',
        items: [{
          productId: Number(selectedProduct),
          quantity,
          total: itemTotal
        }]
      });

      alert('Item adicionado e estoque atualizado');

      // Diminuir estoque do produto
      await axios.put(`http://localhost:5000/stock/${selectedProduct}`, {
        stock: selectedProductStock - quantity
      });


      // Impressão para cozinha
      if (selectedCategory === 'porção' || selectedCategory === 'lanche') {
        printJS({
          printable: [{
            productName: selectedProductName,
            quantity,
            price: selectedProductPrice,
            total: itemTotal,
            note
          }],
          properties: ['productName', 'quantity', 'price', 'total', 'note'],
          type: 'json',
          header: 'Pedido da Cozinha'
        });
      }

      // Limpar campos
      setSelectedCategory('');
      setSelectedProduct('');
      setQuantity(1);
      setNote('');

      // Voltar automaticamente
      navigate('/comandas');

    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert('Erro ao adicionar item.');
      }
    }
  };

  return (
    <div className="sales-container">
      <Link to="/Menu">
        <img src={logo} alt="Logo" className="sales-logo" />
      </Link>

      <h2 className="centered-title">VENDAS</h2>

      <label>
        Mesa / Cliente:
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Informe a mesa"
        />
      </label>

      <label>
        Categoria:
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Selecione</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label>
        Produto:
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          disabled={!selectedCategory}
        >
          <option value="">Selecione</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Estoque: {p.stock})
            </option>
          ))}
        </select>
      </label>

      <label>
        Observação:
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: sem sal, sem gelo..."
        />
      </label>

      <label>
        Quantidade:
        <input
          type="number"
          min={1}
          max={selectedProductStock}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>

      <button type="button" onClick={handleAddItem}>
        Adicionar Item
      </button>
    </div>
  );
};

export default Sales;
