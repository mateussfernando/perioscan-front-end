"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://perioscan-back-end-fhhq.onrender.com";

export default function useVitimas(casoId) {
  const [vitimas, setVitimas] = useState([]);
  const [loadingVitimas, setLoadingVitimas] = useState(false);
  const [errorVitimas, setErrorVitimas] = useState("");

  useEffect(() => {
    if (!casoId) return;
    setLoadingVitimas(true);
    setErrorVitimas("");
    const token = localStorage.getItem("token");
    console.log("[useVitimas] Iniciando busca de vítimas para o caso:", casoId);
    console.log("[useVitimas] Token encontrado:", token);
    if (!token) {
      setErrorVitimas("Usuário não autenticado");
      setVitimas([]);
      setLoadingVitimas(false);
      console.log("[useVitimas] Usuário não autenticado. Abortando fetch.");
      return;
    }
    const url = `${API_BASE}/api/cases/${casoId}/victims`;
    console.log("[useVitimas] URL do fetch:", url);
    fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        console.log("[useVitimas] Status da resposta:", res.status);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.log("[useVitimas] Erro na resposta:", errorData);
          throw new Error(errorData.message || "Erro ao buscar vítimas do caso.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("[useVitimas] Dados recebidos:", data);
        setVitimas(data?.data || []);
      })
      .catch((err) => {
        console.log("[useVitimas] Erro no catch:", err);
        setErrorVitimas(err.message || "Erro ao buscar vítimas do caso.");
        setVitimas([]);
      })
      .finally(() => {
        setLoadingVitimas(false);
        console.log("[useVitimas] Finalizou busca de vítimas.");
      });
  }, [casoId]);

  return {
    vitimas,
    loadingVitimas,
    errorVitimas,
  };
}
