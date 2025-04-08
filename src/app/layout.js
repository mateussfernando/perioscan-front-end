// app/layout.js
"use client";
import "./reset.css";
import "./globals.css";
// import Navbar from "../components/navasidebar";
// import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <>{children}</>
      </body>
    </html>
  );
}

