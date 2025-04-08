// app/layout.js
"use client";
import "./reset.css";
import "./globals.css";
import Navbar from "../components/navasidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutComNavegaçãoCondicional>{children}</LayoutComNavegaçãoCondicional>
      </body>
    </html>
  );
}

function LayoutComNavegaçãoCondicional({ children }) {
  const pathname = usePathname();

  // Função que verifica se a navbar deve aparecer
  const deveExibirNavegação = () => {
    // Especificando a página onde a navbar deve aparecer
    const exibirEm = ["/admincadastramento"];
    return exibirEm.includes(pathname);
  };

  // Função que verifica se a navbar não deve aparecer
  const deveOcultarNavegação = () => {
    // Especificando as páginas onde a navbar deve ser oculta
    const ocultarEm = ["/"];
    return ocultarEm.includes(pathname);
  };

  // Determinar se a navbar deve ser renderizada
  let mostrarNavbar;
  if (deveOcultarNavegação()) {
    mostrarNavbar = false;
  } else if (deveExibirNavegação()) {
    mostrarNavbar = true;
  } else {
    // Comportamento padrão quando não está em páginas de ocultar nem de exibir
    mostrarNavbar = true;
  }

  return (
    <>
      {mostrarNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}