import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Sales from './pages/Sales';
import Faturamento from './pages/Faturamento';
import Clients from './pages/Clients';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Products from './pages/Products';
import Comandas from './pages/Comandas';

const App: React.FC = () => {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/faturamento" element={<Faturamento />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/products" element={<Products />} />
          <Route path="/comandas" element={<Comandas />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App; 