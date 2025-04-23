"use client";
import Image from "next/image";
import Link from "next/link";
import "./BotaoAsideNav.css";
// import BotaoAsideNav from "../components/ui/BotaoAsideNav/BotaoAsideNav";

function BotaoAsideNav({ logo, src, alt, label, isOpen, active }) {
  return (
    <li className={active ? "active" : ""}>
      <Link href={src}>
        <div className="nav-link" title={!isOpen ? label : ""}>
          <Image
            src={logo || "/placeholder.svg"}
            alt={alt}
            width={32}
            height={32}
          />
          {isOpen && <span>{label}</span>}
        </div>
      </Link>
    </li>
  );
}

export default BotaoAsideNav;
