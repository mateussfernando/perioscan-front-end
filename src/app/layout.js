// app/layout.js
"use client";
import "./reset.css";
import "./globals.css";
// import Navbar from "../components/navasidebar";
// import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
       <head>
        <title>PerioScan | Pericias Odontolegais</title>
        <meta name="description" content="Solução digital especializada no gerenciamento de perícias odontológicas forenses, otimizando processos, organização e segurança das informações periciais."/>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <>{children}</>
      </body>
    </html>
  );
}

