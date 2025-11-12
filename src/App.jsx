import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Profile from './pages/Profile'
import Employee from './pages/Employee'
import Login from './pages/Login'
import './App.css'

function App() {
  // Estado para controlar a autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função passada para o componente de Login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      <Routes>
        {/* Rota de Login */}
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />

        {/* Rota do Dashboard (Funcionário) - Protegida */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Employee /> : <Navigate to="/login" replace />
          } 
        />

        {/* Rota do Perfil (Cliente) - Protegida */}
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
          } 
        />

        {/* Rota Padrão: Redireciona para o login ou dashboard */}
        <Route 
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </div>
  )
}

export default App