import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Profile from './pages/Profile'
import Employee from './pages/Employee'
import './App.css'

function NavigationButtons() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname === '/') {
    return (
      <nav className='nav'>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          
          <Button  variant="contained" color="primary" sx={{ m: 2 }}>
            Sou Cliente
          </Button>
         
        </Link>

        <Link to="/employee" style={{ textDecoration: 'none' }}>
          <Button  variant="contained" color="primary" sx={{ m: 2 }}>
            Sou Funcionário
          </Button>
        </Link>
      </nav>
    )
  }

  return (
    <nav>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ m: 2 }}
      >
        Voltar para Início
      </Button>
    </nav>
  )
}

function App() {
  return (
    <div className="App">
      <NavigationButtons />

      <Routes>
        <Route path="/" element={<div>Página Inicial</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/employee" element={<Employee />} />
      </Routes>
    </div>
  )
}

export default App