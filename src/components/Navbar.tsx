'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Navbar.module.css';
import { Button, } from '@mui/material';
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
        <Link href="/" className={styles.logo}>
          <Image 
            src="/images/logo.png" 
            alt="PsicoSoft Logo" 
            width={150} 
            height={40}
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
          <Button href="/" className={styles.navLink} color="secondary">
            Home
          </Button>
          <Button href="/cadastro" className={styles.navLink} color="secondary">
            Cadastro
          </Button>
          <Button href="/agendar" className={styles.navLink} color="secondary">
            Agendar
          </Button>
          <Button href="/login" variant="contained" color="primary">
            Login 
          </Button>
        </div>
      </div>
    </nav>
    </ThemeProvider>
  );
};

export default Navbar;
