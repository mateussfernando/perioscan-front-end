// pages/nao-autorizado.js
"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "../styles/nao-autorizado.css";

export default function NaoAutorizado() {
  const router = useRouter();

  return (
    <div className="naoautorizado-container">
      <div className="naoautorizado-card">
        {/* Logo */}
        <div className="naoautorizado-logo-container">
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="Logo PerioScan"
            width={80}
            height={80}
          />
        </div>

        {/* Ícone de alerta */}
        <div className="naoautorizado-alert-icon">
          <AlertTriangle className="naoautorizado-icon" />
        </div>

        {/* Título e mensagem */}
        <h1 className="naoautorizado-title">Acesso Restrito</h1>
        <p className="naoautorizado-message">
          Você não possui permissão para acessar esta página. Por favor, entre
          em contato com o administrador do sistema.
        </p>

        {/* Botão de voltar */}
        <div className="naoautorizado-button-container">
          <button
            onClick={() => router.back()}
            className="naoautorizado-back-button"
          >
            <ArrowLeft className="naoautorizado-button-icon" />
            Voltar para página anterior
          </button>
        </div>

        {/* Link para página inicial */}
        <div className="naoautorizado-link-container">
          <Link href="/" className="naoautorizado-home-link">
            Ou retorne à página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
