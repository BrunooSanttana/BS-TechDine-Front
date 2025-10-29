import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/presleylogo-removebg-preview.png';
import './Menu.css';

// Interface para definir a estrutura de um módulo
interface Module {
  name: string;
  path: string;
  desc: string;
}

// Array tipado de módulos
const modules: Module[] = [
  { name: 'Vendas', path: '/sales', desc: 'Registre pedidos e comandas de forma ágil.' },
  { name: 'Faturamento', path: '/faturamento', desc: 'Acesse relatórios de vendas e receita.' },
  { name: 'Clientes', path: '/clients', desc: 'Cadastre, edite e gerencie informações de clientes.' },
  { name: 'Produtos', path: '/products', desc: 'Adicione ou edite itens do cardápio.' },
  { name: 'Comandas', path: '/comandas', desc: 'Monitore e administre comandas abertas.' },
  { name: 'Estoque', path: '/Menu', desc: 'Controle o estoque de produtos. (Em desenvolvimento)' },
  { name: 'Perfis de Acesso', path: '/Menu', desc: 'Defina permissões de colaboradores. (Em breve)'  },
  { name: 'Promoções', path: '/Menu', desc: 'Crie promoções e descontos programados. (Em breve)' },
  { name: 'Impressão de Comandas', path: '/Menu', desc: 'Gere e imprima comandas. (Em breve)' },
];

// Componente tipado como React.FC (Function Component)
const Menu: React.FC = () => {
  return (
    <div className="menu-container">
      <Link to="/home">
      <img src={logo} alt="Logo" className="menu-logo" />
      </Link>
      <div className="menu-cards">
        {modules.map((module: Module, index: number) => (
          <div className="menu-card" key={index}>
            <h3>{module.name}</h3>
            <p>{module.desc}</p>
            <Link to={module.path} className="menu-btn">Acessar</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu; 