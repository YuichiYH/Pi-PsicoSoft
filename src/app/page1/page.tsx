import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import Button from '@mui/material/Button';

export default function Page1() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Page 1</h1>
        <p>This is your new subpage created with Next.js App Router.</p>
        <Button variant="contained">Hello World</Button>
        
        <div className={styles.ctas}>
          <Link href="/" className={styles.secondary}>
            Back to Home
          </Link>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <Link href="/">
          Home
        </Link>
      </footer>
    </div>
  );
}
