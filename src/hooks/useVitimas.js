"use client";

import { useState, useEffect } from "react";

export default function useVitimas(casoId) {
  const [vitimas, setVitimas] = useState([]);
  const [loadingVitimas, setLoadingVitimas] = useState(true);
  const [errorVitimas, setErrorVitimas] = useState(null);

  // Buscar vítimas do caso
  useEffect(() => {
    const fetchVitimas = async () => {
      if (!casoId) {
        setLoadingVitimas(false);
        return;
      }

      try {
        setLoadingVitimas(true);
        setErrorVitimas(null);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Usuário não autenticado");
        }

        console.log("Buscando vítimas para o caso:", casoId);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/victims`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Resposta da API de vítimas:", response.status);

        if (response.status === 401) {
          throw new Error("Não autorizado");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Erro ao carregar vítimas: ${response.status} - ${
              errorData.message || "Erro desconhecido"
            }`
          );
        }

        const data = await response.json();
        console.log("Dados das vítimas recebidos:", data);

        if (data.success && Array.isArray(data.data)) {
          setVitimas(data.data);
        } else if (Array.isArray(data)) {
          // Caso a API retorne diretamente um array
          setVitimas(data);
        } else {
          console.warn("Formato de resposta inesperado:", data);
          setVitimas([]);
        }
      } catch (error) {
        console.error("Erro ao carregar vítimas:", error);
        setErrorVitimas(`Falha ao carregar vítimas: ${error.message}`);
        setVitimas([]);
      } finally {
        setLoadingVitimas(false);
      }
    };

    fetchVitimas();
  }, [casoId]);

  return {
    vitimas,
    loadingVitimas,
    errorVitimas,
  };
}
