import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function Page1() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Page 1</h1>
        <p>This is your new subpage created with Next.js App Router.</p>
        
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
