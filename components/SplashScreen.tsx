"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.splashContainer} role="alert" aria-busy="true" aria-label="Carregando GameHunter">
      <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
        <Logo size={120} />
        <h1 className="text-3xl font-black tracking-widest text-foreground font-mono mt-2">
          GAME<span className="text-primary">HUNTER</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Caçador de Ofertas & Alertas
        </p>
      </div>
    </div>
  );
}
