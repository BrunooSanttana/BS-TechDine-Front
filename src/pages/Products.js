import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importando Link
import logo from '../images/presleylogo.png';

const Products = () => {
    const [category, setCategory] = useState('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');


    // Função para buscar categorias do backend
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data); // Assume que data é uma lista de categorias com id e nome
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




    useEffect(() => {
        fetchCategories(); // Busca categorias quando o componente é montado
    }, []);

    const handleCategorySubmit = async (event) => {
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
                const newCategory = await response.json();
                setCategories([...categories, newCategory]); // Adiciona a nova categoria à lista
                setCategory('');
                console.log('Categoria criada com sucesso:', newCategory);
                setSuccessMessage('Categoria criada com sucesso!');
                // Limpa a mensagem de sucesso após 5 segundos
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                console.error('Erro ao adicionar categoria');
            }
        } catch (error) {
            console.error('Erro ao conectar ao servidor', error);
        }
    };

    const handleProductSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: productName,
                    price: price,
                    categoryId: category,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao cadastrar produto');
            }

            const result = await response.json();
            console.log('Produto cadastrado com sucesso:', result);

            // Define a mensagem de sucesso e limpa os campos
            setSuccessMessage('Produto cadastrado com sucesso!');
            setProductName('');
            setPrice('');
            setCategory('');

            // Limpa a mensagem de sucesso após 5 segundos
            setTimeout(() => {
                setSuccessMessage('');
            }, 2000);
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            setSuccessMessage('Erro ao cadastrar produto.');
        }
    };


    return (
        <div>

            {/* Logo como link para o Menu */}
            <Link to="/Menu">
                <img src={logo} alt="Logo" style={{ cursor: 'pointer', width: '100px', marginBottom: '20px' }} />
            </Link>
            <h2 className="centered-title">Cadastrar Produto</h2>
            {/* Formulário para cadastrar categorias */}
            <form onSubmit={handleCategorySubmit}>
                <label>
                    Categoria:
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Preço:
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Categoria:
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Selecione uma categoria</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>  {/* Use o ID da categoria como value */}
                                {cat.name}
                            </option>
                        ))}
                    </select>

                </label>
                <br />
                <button type="submit">Cadastrar Produto</button>
            </form>
            {successMessage && <p className="success-message"> {successMessage}</p>}
        </div>
    );
};

export default Products;
