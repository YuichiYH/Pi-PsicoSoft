import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

const theme = createTheme({
  palette: {
    primary: {
      light: '#5f230bff',
      main: '#db3300ff',
      dark: '#682312ff',
      contrastText: '#fff',
    },
    secondary: {
      light: '#0066ffff',
      main: '#0044ffff',
      dark: '#0022ffff',
      contrastText: '#fff',
    },
  }
});

  return (
    <ThemeProvider theme={theme}>
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img 
            src="/images/logo.png" 
            alt="PsicoSoft Logo" 
            width="150" 
            height="40"
          />
        </Link>
        
        <button 
          className={styles.menuButton} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.menuIcon}></span>
        </button>

        <div className={`${styles.menuItems} ${isMenuOpen ? styles.active : ''}`} >
          <Button component={Link} to="/" className={styles.navLink} color="secondary">
            Home
          </Button>
          <Button component={Link} to="/cadastro" className={styles.navLink} color="secondary">
            Cadastro
          </Button>
          <Button component={Link} to="/agendar" className={styles.navLink} color="secondary">
            Agendar
          </Button>
          <Button component={Link} to="/login" variant="contained" color="primary">
            Login 
          </Button>
        </div>
      </div>
    </nav>
    </ThemeProvider>
  );
};

export default Navbar;
