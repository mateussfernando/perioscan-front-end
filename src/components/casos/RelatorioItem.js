"use client";

import { Download, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";

export default function RelatorioItem({
  relatorio,
  onBaixarPDF,
  baixandoPDF,
  onAssinar,
  assinando,
  onExcluir,
}) {
  const [excluindo, setExcluindo] = useState(false);
  const relatorioId = relatorio._id || relatorio.id;

  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "--";

    const data = new Date(dataISO);
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000
    );

    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    switch (status?.toLowerCase()) {
      case "assinado":
        return "status-finalizado";
      case "finalizado":
        return "status-em-andamento";
      case "rascunho":
        return "status-pendente";
      default:
        return "status-outro";
    }
  };

  // Verificar se o relatório está assinado
  const estaAssinado =
    relatorio.status?.toLowerCase() === "assinado" ||
    !!relatorio.digitalSignature;

  // Função para excluir relatório
  const excluirRelatorio = async () => {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) {
      return;
    }

    setExcluindo(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao excluir relatório: ${response.status}`);
      }

      // Recarregar a página para atualizar a lista de relatórios
      window.location.reload();
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      alert(`Falha ao excluir relatório: ${error.message}`);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="relatorio-item">
      <div className="relatorio-info">
        <h3>{relatorio.title || "Relatório"}</h3>
        <p>Criado em: {formatarData(relatorio.createdAt)}</p>
        <p>Status: {relatorio.status || "Rascunho"}</p>
      </div>
      <div className="relatorio-acoes">
        {!estaAssinado && (
          <button
            className="btn-acao btn-assinar"
            onClick={() => onAssinar(relatorioId)}
            disabled={assinando[relatorioId]}
            title="Assinar Relatório"
          >
            {assinando[relatorioId] ? (
              <span className="spinner"></span>
            ) : (
              <CheckCircle size={16} />
            )}
          </button>
        )}
        <button
          className="btn-acao"
          onClick={() => onBaixarPDF(relatorioId)}
          disabled={baixandoPDF[relatorioId]}
          title="Baixar PDF"
        >
          {baixandoPDF[relatorioId] ? (
            <span className="spinner"></span>
          ) : (
            <Download size={16} />
          )}
        </button>
        <button
          className="btn-acao btn-excluir"
          onClick={() => onExcluir(relatorioId)}
          disabled={excluindo}
          title="Excluir Relatório"
        >
          {excluindo ? <span className="spinner"></span> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}
