"use client";
import { useState, useEffect } from "react";

export default function TestConnection() {
  const [status, setStatus] = useState<string>("Verificando conexão...");

  useEffect(() => {
    const fetchData = async () => {
      const data = await checkHealth();
      if (data) {
        setStatus(
          `✅ Conexão estabelecida com sucesso - ${formatDate(data.timestamp)}`
        );
      } else {
        setStatus("❌ Falha ao conectar com o backend. Verifique a API.");
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Teste de Conexão com o Backend</h2>
      <p>{status}</p>
    </div>
  );
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://perioscan-back-end.onrender.com";

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error("Erro ao conectar com o backend");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    return null;
  }
};

// Função para formatar o timestamp para um formato mais legível
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
};
