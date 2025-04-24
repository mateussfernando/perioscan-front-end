"use client";

import { useState } from "react";
import "../../styles/modal-criar-relatorio.css";

const ModalCriarRelatorio = ({
  isOpen,
  onClose,
  casoId,
  casoTitulo,
  onRelatorioCriado,
}) => {
  const [formData, setFormData] = useState({
    title: `Relatório - ${casoTitulo || "Caso"}`,
    content: "",
    methodology: "",
    conclusion: "",
    status: "rascunho",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdReportId, setCreatedReportId] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        case: casoId,
      };

      const response = await fetch(
        "https://perioscan-back-end.onrender.com/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao criar relatório");
      }

      const data = await response.json();
      setCreatedReportId(data._id);
      setSuccess("Relatório criado com sucesso!");
      if (onRelatorioCriado) onRelatorioCriado(data);
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao criar o relatório");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!createdReportId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://perioscan-back-end.onrender.com/api/reports/${createdReportId}/pdf`,
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
      a.download = `relatorio-${createdReportId}.pdf`;

      // Adicionar à página, clicar e remover
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("PDF exportado com sucesso!");
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao exportar o PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSignReport = async () => {
    if (!createdReportId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://perioscan-back-end.onrender.com/api/reports/${createdReportId}/sign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao assinar o relatório");
      }

      setSuccess("Relatório assinado com sucesso!");
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao assinar o relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container relatorio-modal">
        <div className="modal-header">
          <h2>Criar Relatório</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Título do Relatório</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="methodology">Metodologia</label>
              <textarea
                id="methodology"
                name="methodology"
                value={formData.methodology}
                onChange={handleChange}
                placeholder="Descreva a metodologia utilizada..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Conteúdo do Relatório</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Descreva detalhadamente o relatório..."
                required
                rows={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="conclusion">Conclusão</label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={formData.conclusion}
                onChange={handleChange}
                placeholder="Descreva a conclusão do relatório..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="rascunho">Rascunho</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div className="form-actions">
              {!createdReportId ? (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Criando..." : "Criar Relatório"}
                </button>
              ) : (
                <div className="report-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleExportPDF}
                    disabled={loading}
                  >
                    {loading ? "Exportando..." : "Exportar como PDF"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSignReport}
                    disabled={loading}
                  >
                    {loading ? "Assinando..." : "Assinar Relatório"}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCriarRelatorio;
