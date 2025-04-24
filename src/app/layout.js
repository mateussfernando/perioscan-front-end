// app/layout.js
"use client";

import "./reset.css";
import "./globals.css";
import { useEffect } from "react";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function RootLayout({ children }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js").then(
          function(registration) {
            console.log("Service Worker registrado com sucesso:", registration.scope);
          },
          function(err) {
            console.log("Falha ao registrar Service Worker:", err);
          }
        );
      });
    }
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <title>PerioScan | Pericias Odontolegais</title>
        <meta
          name="description"
          content="Solução digital especializada no gerenciamento de perícias odontológicas forenses, otimizando processos, organização e segurança das informações periciais."
        />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PerioScan" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PerioScan" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
