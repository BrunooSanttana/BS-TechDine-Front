import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import printJS from 'print-js';
import './Sales.css';

// Interfaces para definir as estruturas de dados
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
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const navigate = useNavigate();
  const { tableNumberParam } = useParams<{ tableNumberParam?: string }>();
  const [tableNumber, setTableNumber] = useState<string>(tableNumberParam || '');
  const [note, setNote] = useState<string>('');

  // Recuperar pedidos do Local Storage quando a página for carregada
  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      try {
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Erro ao fazer parse dos pedidos:', error);
        setOrders([]);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:5000/categories');
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async (): Promise<void> => {
        try {
          const response = await fetch(`http://localhost:5000/categories/${selectedCategory}/products`);
          const data: Product[] = await response.json();
          setProducts(data);
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        }
      };

      fetchProducts();
    }
  }, [selectedCategory]);

  useEffect(() => {
    const selected = products.find(product => product.id === parseInt(selectedProduct, 10));
    if (selected) {
      setSelectedProductName(selected.name);
      setSelectedProductPrice(selected.price);
    } else {
      setSelectedProductName('');
      setSelectedProductPrice(0);
    }
  }, [selectedProduct, products]);

  // Função para salvar os pedidos no Local Storage
  const saveOrdersToLocalStorage = (orders: Order[]): void => {
    localStorage.setItem('salesOrders', JSON.stringify(orders));
  };

  const handleAddItem = (): void => {
    if (!tableNumber) {
      alert('Por favor, informe o número ou nome do cliente.');
      return;
    }

    if (selectedCategory && selectedProduct && quantity > 0) {
      const itemTotal = selectedProductPrice * quantity;
      const existingOrderIndex = orders.findIndex(order => order.tableNumber === tableNumber);

      if (existingOrderIndex !== -1) {
        const existingOrder = orders[existingOrderIndex];
        const existingItemIndex = existingOrder.items.findIndex(item => item.product === selectedProduct);

        if (existingItemIndex !== -1) {
          // Atualizar o item existente
          const updatedOrders = [...orders];
          const itemToUpdate = updatedOrders[existingOrderIndex].items[existingItemIndex];
          itemToUpdate.quantity += quantity;
          itemToUpdate.total = itemToUpdate.price * itemToUpdate.quantity;

          updatedOrders[existingOrderIndex] = {
            ...existingOrder,
            items: [
              ...updatedOrders[existingOrderIndex].items.slice(0, existingItemIndex),
              itemToUpdate,
              ...updatedOrders[existingOrderIndex].items.slice(existingItemIndex + 1)
            ]
          };
          setOrders(updatedOrders);
          saveOrdersToLocalStorage(updatedOrders);
        } else {
          // Adicionar um novo item
          const updatedOrders = [...orders];
          updatedOrders[existingOrderIndex].items.push({
            category: selectedCategory,
            product: selectedProduct,
            productName: selectedProductName,
            price: selectedProductPrice,
            quantity: quantity,
            total: itemTotal,
            note: note
          });
          setOrders(updatedOrders);
          saveOrdersToLocalStorage(updatedOrders);
        }
      } else {
        // Adicionar um novo pedido
        const newOrder: Order = {
          tableNumber,
          items: [
            {
              category: selectedCategory,
              product: selectedProduct,
              productName: selectedProductName,
              price: selectedProductPrice,
              quantity: quantity,
              total: itemTotal,
              note: note
            }
          ]
        };
        const updatedOrders = [...orders, newOrder];
        setOrders(updatedOrders);
        saveOrdersToLocalStorage(updatedOrders);
      }
      
      // Imprimir itens se a categoria for "porção" ou "lanche"
      if (selectedCategory === 'porção' || selectedCategory === 'lanche') {
        const newItem: PrintItem = {
          productName: selectedProductName,
          quantity: quantity,
          price: selectedProductPrice,
          total: itemTotal,
          note: note
        };
        printJS({
          printable: [newItem],
          properties: ['productName', 'quantity', 'price', 'total', 'note'],
          type: 'json',
          header: 'Pedido da Cozinha'
        });
      }
      
      // Limpar campos após adicionar item
      setSelectedCategory('');
      setSelectedProduct('');
      setSelectedProductName('');
      setSelectedProductPrice(0);
      setQuantity(1);
      setNote('');
      navigate('/comandas');
    }
  };

  // Função para preencher automaticamente o número da mesa/comanda ou cliente ao clicar no pedido listado
  const handleSelectOrder = (orderTableNumber: string): void => {
    setTableNumber(orderTableNumber);
  };

  const handleRemoveItem = (orderIndex: number, itemIndex: number): void => {
    const updatedOrders = [...orders];
    const itemToRemove = updatedOrders[orderIndex].items[itemIndex];

    if (itemToRemove) {
      if (itemToRemove.quantity > 1) {
        // Decrementar a quantidade e atualizar o total
        itemToRemove.quantity -= 1;
        itemToRemove.total = itemToRemove.price * itemToRemove.quantity;
      } else {
        // Remover o item se a quantidade for 1
        updatedOrders[orderIndex].items.splice(itemIndex, 1);
      }

      if (updatedOrders[orderIndex].items.length === 0) {
        updatedOrders.splice(orderIndex, 1);
      }
      setOrders(updatedOrders);
      saveOrdersToLocalStorage(updatedOrders);
    }
  };

  const calculateOrderTotal = (order: Order): string => {
    return order.items.reduce((total, item) => total + item.total, 0).toFixed(2);
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (!tableNumber) {
      alert('Por favor, informe o número da mesa.');
      return;
    }

    const currentOrderIndex = orders.findIndex(order => order.tableNumber === tableNumber);

    if (currentOrderIndex === -1 || orders[currentOrderIndex].items.length === 0) {
      alert('Por favor, adicione itens ao pedido antes de finalizar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber,
          paymentMethod,
          items: orders[currentOrderIndex].items
        }),
      });

      if (response.ok) {
        alert('Pedido realizado com sucesso!');
        const updatedOrders = orders.filter((_, index) => index !== currentOrderIndex);
        setOrders(updatedOrders);
        localStorage.setItem('salesOrders', JSON.stringify(updatedOrders));
        setTableNumber('');
        setPaymentMethod('');
        
        // Criar o resumo da conta
        const summary: PrintItem[] = orders[currentOrderIndex].items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          note: item.note
        }));
       

        // Imprimir o resumo da conta na impressora do bar
        printJS({
          printable: summary,
          properties: ['productName', 'quantity', 'total', 'note'],
          type: 'json',
          header: 'Resumo da Conta'
        });

        // Redireciona de volta para a página de comandas após finalizar o pedido
        navigate('/comandas');
      } else {
        alert('Erro ao realizar o pedido');
      }
    } catch (error) {
      console.error('Erro ao enviar o pedido:', error);
      alert('Erro ao realizar o pedido');
    }
  };

  return (
    <div className="sales-container">
      <Link to="/Menu">
      <img src={logo} alt="Logo" className="sales-logo" />
      </Link>
      <h2 className="centered-title">VENDAS</h2>
      <div>
        <label>
          Mesa / Cliente:
          <input
            type="text"
            value={tableNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTableNumber(e.target.value)}
            placeholder="Informe o número ou nome do cliente"
            required
          />
        </label>
      </div>

      <div>
        <label>
          Categoria:
          <select
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Selecione a Categoria</option>
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Produto:
          <select
            value={selectedProduct}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProduct(e.target.value)}
            disabled={!selectedCategory}
            required
          >
            <option value="">Selecione o Produto</option>
            {products.map((product: Product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>
      </div>
      
      <div>
        <label>
          Observação:
          <input
            type="text"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
            placeholder="Adicione uma observação (opcional)"
          />
        </label>
      </div>

      <div>
        <label>
          Quantidade:
          <input
            type="number"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
            required
          />
        </label>
      </div>

      <button onClick={handleAddItem} type="button">Adicionar Item</button>

      <br></br><br></br><br></br>

      <div>
        <h3 className="summary-title">Resumo do Pedido:</h3>
        {orders.length === 0 ? (
          <p>Nenhum item adicionado.</p>
        ) : (
          <div className="order-summary">
            {orders.map((order: Order, orderIndex: number) => (
              <div key={orderIndex} className="order-details">
                <h4 className="order-header">
                  <span
                    className="clickable"
                    onClick={() => handleSelectOrder(order.tableNumber)}
                  >
                    Mesa / Cliente: {order.tableNumber}
                  </span>
                </h4>
                <ul className="order-items">
                  {order.items.map((item: OrderItem, itemIndex: number) => (
                    <li key={itemIndex} className="order-item">
                      {item.productName} - {item.quantity} x R${item.price} = R${item.total}
                      {item.note && (
                        <p className="item-note">Observação: {item.note}</p>
                      )}
                      <button 
                        className="remove-button" 
                        onClick={() => handleRemoveItem(orderIndex, itemIndex)}
                        type="button"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="order-total">Total do Pedido: R${calculateOrderTotal(order)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <label>
          Método de Pagamento:
          <select 
            value={paymentMethod} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Selecione a forma de pagamento</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="débito">Débito</option>
            <option value="crédito">Crédito</option>
          </select>
        </label>
      </div>

      <button onClick={handleSubmitOrder} type="button">Finalizar Pedido</button>
    </div>
  );
};

export default Sales; 