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
        <LayoutWithConditionalNavbar>{children}</LayoutWithConditionalNavbar>
      </body>
    </html>
  );
}

function LayoutWithConditionalNavbar({ children }) {
  const pathname = usePathname();

  // Rotas onde a navbar não deve aparecer
  const hideNavbarOn = ["/", "/login"];
  const shouldHideNavbar = hideNavbarOn.includes(pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
