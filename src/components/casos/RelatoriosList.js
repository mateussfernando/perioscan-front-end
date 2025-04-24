"use client";

import { useState, useEffect } from "react";
import "../../styles/relatorios-list.css";

const RelatoriosList = ({ casoId }) => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        // Aqui você precisaria de um endpoint para buscar relatórios por caso
        // Como não foi fornecido, estou assumindo que existe ou pode ser implementado
        const response = await fetch(
          `https://perioscan-back-end.onrender.com/api/reports?case=${casoId}`
        );

        if (!response.ok) {
          throw new Error("Falha ao buscar relatórios");
        }

        const data = await response.json();
        setRelatorios(data);
      } catch (err) {
        setError("Erro ao carregar relatórios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (casoId) {
      fetchRelatorios();
    }
  }, [casoId]);

  const handleExportPDF = async (relatorioId) => {
    try {
      const response = await fetch(
        `https://perioscan-back-end.onrender.com/api/reports/${relatorioId}/pdf`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao exportar relatório como PDF");
      }

      // Criar um blob a partir da resposta
      const blob = await response.blob();

      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob);

      // Criar um link para download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `relatorio-${relatorioId}.pdf`;

      // Adicionar à página, clicar e remover
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Erro ao exportar o PDF");
    }
  };

  const handleDeleteReport = async (relatorioId) => {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://perioscan-back-end.onrender.com/api/reports/${relatorioId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir relatório");
      }

      // Atualizar a lista de relatórios
      setRelatorios(relatorios.filter((rel) => rel._id !== relatorioId));
    } catch (err) {
      console.error("Erro ao excluir relatório:", err);
      alert("Erro ao excluir o relatório");
    }
  };

  if (loading) {
    return <div className="relatorios-loading">Carregando relatórios...</div>;
  }

  if (error) {
    return <div className="relatorios-error">{error}</div>;
  }

  if (relatorios.length === 0) {
    return (
      <div className="relatorios-empty">
        Nenhum relatório encontrado para este caso.
      </div>
    );
  }

  return (
    <div className="relatorios-list">
      <h3>Relatórios do Caso</h3>
      <div className="relatorios-container">
        {relatorios.map((relatorio) => (
          <div key={relatorio._id} className="relatorio-item">
            <div className="relatorio-info">
              <h4>{relatorio.title}</h4>
              <p className={`relatorio-status status-${relatorio.status}`}>
                {relatorio.status === "rascunho" ? "Rascunho" : "Finalizado"}
              </p>
              <p className="relatorio-date">
                Criado em:{" "}
                {new Date(relatorio.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="relatorio-actions">
              <button
                className="btn-export-pdf"
                onClick={() => handleExportPDF(relatorio._id)}
                title="Exportar como PDF"
              >
                📄
              </button>
              <button
                className="btn-delete-report"
                onClick={() => handleDeleteReport(relatorio._id)}
                title="Excluir relatório"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatoriosList;
