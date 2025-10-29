import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';

// Interface para definir a estrutura de uma categoria
interface Category {
  id: number;
  name: string;
}

// Interface para definir a estrutura de um produto
interface Product {
  id?: number;
  name: string;
  price: number;
  categoryId: number;
}

// Interface para a resposta da API de categorias
interface CategoryResponse {
  id: number;
  name: string;
}

// Interface para a resposta da API de produtos
interface ProductResponse {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}

const Products: React.FC = () => {
  const [category, setCategory] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Função para buscar categorias do backend
  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data: CategoryResponse[] = await response.json();
        setCategories(data);
      } else {
        console.error('Erro ao buscar categorias');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: category }),
      });
      
      if (response.ok) {
        const newCategory: CategoryResponse = await response.json();
        setCategories([...categories, newCategory]);
        setCategory('');
        console.log('Categoria criada com sucesso:', newCategory);
        setSuccessMessage('Categoria criada com sucesso!');
        
        // Limpa a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        console.error('Erro ao adicionar categoria');
        setSuccessMessage('Erro ao adicionar categoria.');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor', error);
      setSuccessMessage('Erro ao conectar ao servidor.');
    }
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName,
          price: parseFloat(price),
          categoryId: parseInt(category),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar produto');
      }

      const result: ProductResponse = await response.json();
      console.log('Produto cadastrado com sucesso:', result);

      // Define a mensagem de sucesso e limpa os campos
      setSuccessMessage('Produto cadastrado com sucesso!');
      setProductName('');
      setPrice('');
      setCategory('');

      // Limpa a mensagem de sucesso após 2 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      setSuccessMessage('Erro ao cadastrar produto.');
    }
  };

  return (
   <div className="sales-container">
      <Link to="/Menu">
      <img src={logo} alt="Logo" className="sales-logo" />
      </Link>
      <h2 className="centered-title">Cadastrar Produto</h2>
      
      {/* Formulário para cadastrar categorias */}
      <form onSubmit={handleCategorySubmit}>
        <label>
          Categoria:
          <input
            type="text"
            value={category}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
            required
          />
        </label>
        <button type="submit">Adicionar Categoria</button>
      </form>

      {/* Formulário para cadastrar produtos */}
      <form onSubmit={handleProductSubmit}>
        <label>
          Nome do Produto:
          <input
            type="text"
            value={productName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Preço:
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Categoria:
          <select 
            value={category} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit">Cadastrar Produto</button>
      </form>
      
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Products; 