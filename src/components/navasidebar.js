"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Adicionar", href: "/admincadastramento" },
    { label: "Relatórios", href: "/relatorios" },
    { label: "Gerenciamento", href: "/gerenciamento" },
  ];

  return (
    <aside>
      <div>
        {/* Logo */}
        <div>
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="Logo"
            width={40}
            height={40}
          />
          <span>PerioScan</span>
        </div>

        {/* Perfil */}
        <div>
          <UserCircle size={48} />
          <span>
            Bernardo
            <br />
            Simões
            <br />
            (ADMIN)
          </span>
        </div>

        {/* Navegação */}
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout */}
      <div>
        <button>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
