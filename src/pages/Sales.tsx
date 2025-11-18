import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
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
}

interface OrderItem {
  category: string;
  product: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  note?: string;
}

interface Order {
  tableNumber: string;
  items: OrderItem[];
}

interface PrintItem {
  productName: string;
  quantity: number;
  price: number;
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
  const [quantity, setQuantity] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [note, setNote] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const { tableNumber: tableFromParams } = useParams<{ tableNumber: string }>();
  const [tableNumber, setTableNumber] = useState<string>(tableFromParams || '');

  // Receber mesa do Comandas
  useEffect(() => {
    if (location.state && location.state.tableNumber) {
      setTableNumber(location.state.tableNumber);
    }
  }, [location.state]);

  // Recuperar pedidos salvos
  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        setOrders([]);
      }
    }
  }, []);

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/categories');
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error('Erro ao buscar categorias:', e);
      }
    };
    fetchCategories();
  }, []);

  // Buscar produtos da categoria
  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        try {
          const res = await fetch(`http://localhost:5000/categories/${selectedCategory}/products`);
          const data = await res.json();
          setProducts(data);
        } catch (e) {
          console.error('Erro ao buscar produtos:', e);
        }
      };
      fetchProducts();
    }
  }, [selectedCategory]);

  // Atualizar produto selecionado
  useEffect(() => {
    const product = products.find(p => p.id === Number(selectedProduct));
    if (product) {
      setSelectedProductName(product.name);
      setSelectedProductPrice(product.price);
    } else {
      setSelectedProductName('');
      setSelectedProductPrice(0);
    }
  }, [selectedProduct, products]);

  // Salvar no localStorage
  const saveOrders = (updatedOrders: Order[]) => {
    localStorage.setItem('salesOrders', JSON.stringify(updatedOrders));
  };

  // Adicionar item ao pedido
  const handleAddItem = () => {
    if (!tableNumber) {
      alert('Informe o número da mesa ou cliente.');
      return;
    }
    if (!selectedCategory || !selectedProduct) {
      alert('Selecione categoria e produto.');
      return;
    }

    const itemTotal = selectedProductPrice * quantity;
    const existingOrderIndex = orders.findIndex(o => o.tableNumber === tableNumber);

    let updatedOrders = [...orders];

    if (existingOrderIndex !== -1) {
      const order = updatedOrders[existingOrderIndex];
      const existingItemIndex = order.items.findIndex(i => i.product === selectedProduct);

      if (existingItemIndex !== -1) {
        const item = order.items[existingItemIndex];
        item.quantity += quantity;
        item.total = item.quantity * item.price;
      } else {
        order.items.push({
          category: selectedCategory,
          product: selectedProduct,
          productName: selectedProductName,
          price: selectedProductPrice,
          quantity,
          total: itemTotal,
          note
        });
      }
    } else {
      updatedOrders.push({
        tableNumber,
        items: [{
          category: selectedCategory,
          product: selectedProduct,
          productName: selectedProductName,
          price: selectedProductPrice,
          quantity,
          total: itemTotal,
          note
        }]
      });
    }

    saveOrders(updatedOrders);
    setOrders(updatedOrders);

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
            <option key={p.id} value={p.id}>{p.name}</option>
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
