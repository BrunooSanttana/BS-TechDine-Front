import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo.png';
import { useParams, useNavigate } from 'react-router-dom';
import printJS from 'print-js';
import './Sales.css';




const Sales = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedProductPrice, setSelectedProductPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const navigate = useNavigate();
  const { tableNumberParam } = useParams();
  const [tableNumber, setTableNumber] = useState(tableNumberParam || '');
  const [note, setNote] = useState('');




  // Recuperar pedidos do Local Storage quando a página for carregada
  useEffect(() => {
    const savedOrders = localStorage.getItem('salesOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        try {
          const response = await fetch(`http://localhost:5000/categories/${selectedCategory}/products`);
          const data = await response.json();
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
  const saveOrdersToLocalStorage = (orders) => {
    localStorage.setItem('salesOrders', JSON.stringify(orders));
  };

  const handleAddItem = () => {
    if (!tableNumber) {
      alert('Por favor, informe o número ou nome do cliente.');
      return; // Para evitar a adição se o campo estiver vazio
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
          saveOrdersToLocalStorage(updatedOrders); // Salvar no Local Storage
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
          saveOrdersToLocalStorage(updatedOrders); // Salvar no Local Storage
        }
      } else {
        // Adicionar um novo pedido
        const newOrder = {
          tableNumber,
          items: [
            {
              category: selectedCategory,
              product: selectedProduct,
              productName: selectedProductName,
              price: selectedProductPrice,
              quantity: quantity,
              total: itemTotal
            }
          ]
        };
        const updatedOrders = [...orders, newOrder];
        setOrders(updatedOrders);
        saveOrdersToLocalStorage(updatedOrders); // Salvar no Local Storage
      }
      // Imprimir itens se a categoria for "porção" ou "lanche"
      if (selectedCategory === 'porção' || selectedCategory === 'lanche') {
        const newItem = {
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
  const handleSelectOrder = (orderTableNumber) => {
    setTableNumber(orderTableNumber);
  };

  const handleRemoveItem = (orderIndex, itemIndex) => {
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
      saveOrdersToLocalStorage(updatedOrders); // Atualizar no Local Storage
    }
  };


  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + item.total, 0).toFixed(2);
  };

  const handleSubmitOrder = async () => {
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
        const summary = orders[currentOrderIndex].items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
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
    <div>
      {/* Logo como link para o Menu */}
      <Link to="/Menu">
        <img src={logo} alt="Logo" style={{ cursor: 'pointer', width: '100px', marginBottom: '20px' }} />
      </Link>
      <h2 className="centered-title">VENDAS</h2>
      <div>
        <label>
          Mesa / Cliente:
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Informe o número ou nome do cliente"
          />
        </label>
      </div>

      <div>
        <label>
          Categoria:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Selecione a Categoria</option>
            {categories.map(category => (
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
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">Selecione o Produto</option>
            {products.map(product => (
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
            onChange={(e) => setNote(e.target.value)}
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
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
          />
        </label>
      </div>

      <button onClick={handleAddItem}>Adicionar Item</button>


      <div>
        <h3 className="summary-title">Resumo do Pedido:</h3>
        {orders.length === 0 ? (
          <p>Nenhum item adicionado.</p>
        ) : (
          <div className="order-summary">
            {orders.map((order, orderIndex) => (
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
                  {order.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="order-item">
                      {item.productName} - {item.quantity} x R${item.price} = R${item.total}
                      {item.note && (
                        <p className="item-note">Observação: {item.note}</p>
                      )}
                      <button className="remove-button" onClick={() => handleRemoveItem(orderIndex, itemIndex)}>
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
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Selecione a forma de pagamento</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="débito">Débito</option>
            <option value="crédito">Crédito</option>
          </select>
        </label>

      </div>

      <button onClick={handleSubmitOrder}>Finalizar Pedido</button>
    </div>
  );
};

export default Sales;
