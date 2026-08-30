"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // The CSS animation takes 0.5s and has a 1.5s delay (total 2s).
    // We remove it from DOM after 2 seconds.
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.splashContainer} role="alert" aria-busy="true" aria-label="Carregando GameHunter">
      <Image
        src="/logo.jpg"
        alt="Logo do GameHunter"
        width={200}
        height={200}
        className={styles.logo}
        priority
      />
      <h1 className={styles.title}>GAMEHUNTER</h1>
    </div>
  );
}
