"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("gh_splash_shown");
    if (alreadyShown) return;
    sessionStorage.setItem("gh_splash_shown", "1");
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, 850);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.splashContainer} role="alert" aria-busy="true" aria-label="Carregando GameHunter">
      <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
        <Logo size={115} />
        <h1 className="text-3xl font-black tracking-widest text-foreground font-mono mt-2">
          GAME<span className="text-primary">HUNTER</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-semibold">
          Predador de Ofertas & Keys Digitais
        </p>
      </div>
    </div>
  );
}
