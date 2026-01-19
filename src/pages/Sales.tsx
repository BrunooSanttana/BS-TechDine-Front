import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/presleylogo-removebg-preview.png';
import printJS from 'print-js';
import './Sales.css';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  stock: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  total: number;
  Product: Product;
}

interface Order {
  id: number;
  tableNumber: string;
  paymentMethod: string;
  totalAmount: number;
  OrderItems: OrderItem[];
}

interface Category {
  id: number;
  name: string;
}

const Sales: React.FC = () => {
  // --- Estados ---
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
  const [errorMessage, setErrorMessage] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const { tableNumber: tableFromParams } = useParams<{ tableNumber: string }>();

  // --- Função para mostrar erros ---
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // --- Receber mesa do Comandas ---
  useEffect(() => {
    if (tableFromParams) setTableNumber(tableFromParams);
    if (location.state && location.state.tableNumber) setTableNumber(location.state.tableNumber);
  }, [location.state, tableFromParams]);

  // --- Buscar categorias (sem Matéria Prima) ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/categories');
        const filtered = res.data.filter((c: Category) => c.name !== 'Matéria-Prima');
        setCategories(filtered);
      } catch (e) {
        console.error('Erro ao buscar categorias:', e);
      }
    };
    fetchCategories();
  }, []);

  // --- Buscar produtos da categoria ---
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

  // --- Atualizar produto selecionado ---
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

  // --- Adicionar item ao pedido ---
  const handleAddItem = async () => {
    if (!tableNumber) return showError('Informe o número da mesa ou cliente.');
    if (!selectedCategory || !selectedProduct) return showError('Selecione categoria e produto.');
    if (quantity > selectedProductStock) return showError('Estoque insuficiente para este produto.');

    try {
      // Buscar pedidos abertos
      const existingOrdersRes = await axios.get('http://localhost:5000/orders');
      const existingOrders: Order[] = existingOrdersRes.data;

      // Verifica se já existe uma comanda aberta
      const existingOrder = existingOrders.find(
        (order) => order.tableNumber.toLowerCase() === tableNumber.toLowerCase()
      );

      const itemTotal = selectedProductPrice * quantity;

      if (existingOrder) {
        // Comanda existe → adicionar item
        await axios.post(`http://localhost:5000/orders/${existingOrder.id}/items`, {
          productId: Number(selectedProduct),
          quantity,
          total: itemTotal,
          note,
        });
      } else {
        // Comanda não existe → criar nova
        await axios.post('http://localhost:5000/orders', {
          tableNumber,
          paymentMethod: 'dinheiro',
          items: [
            {
              productId: Number(selectedProduct),
              quantity,
              total: itemTotal,
              note,
            },
          ],
        });
      }

      // Impressão para cozinha
      if (['porção', 'lanche'].includes(selectedCategory.toLowerCase())) {
        printJS({
          printable: [
            {
              productName: selectedProductName,
              quantity,
              price: selectedProductPrice,
              total: itemTotal,
              note,
            },
          ],
          properties: ['productName', 'quantity', 'price', 'total', 'note'],
          type: 'json',
          header: 'Pedido da Cozinha',
        });
      }

      // Limpar campos
      setSelectedCategory('');
      setSelectedProduct('');
      setQuantity(1);
      setNote('');

      navigate('/comandas');
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.error) showError(`Erro: ${error.response.data.error}`);
      else showError('Erro ao adicionar item.');
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

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Sales;
