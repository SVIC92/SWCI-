import React, { useEffect } from "react";
import "./styles/LoadingScreen_login.css";

export default function LoadingScreen() {
  useEffect(() => {
    document.body.classList.add("loading-active");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("loading-active");
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-badge">SW+</div>
        <div className="loading-logo">
          <img src="/logo.png" alt="Logo Corporativo" />
        </div>
  <h2 className="loading-text">Cargando su respectivo panel...</h2>
        <div className="spinner"></div>
      </div>
    </div>
  );
}
