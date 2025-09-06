'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Navbar.module.css';
import { Button } from '@mui/material';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
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

        <div className={`${styles.menuItems} ${isMenuOpen ? styles.active : ''}`}>
          <Button href="/" className={styles.navLink}>
            Home
          </Button>
          <Button href="/cadastro" className={styles.navLink}>
            Cadastro
          </Button>
          <Button href="/agendar" className={styles.navLink}>
            Agendar
          </Button>
          <Button href="/login" variant="contained" color="primary">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
