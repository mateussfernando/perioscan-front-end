"use client";

import { X, CheckCircle2, Download, FileCheck, Loader } from "lucide-react";

export default function ModalVisualizarRelatorio({
  relatorio,
  formatarData,
  onFechar,
  onBaixarPDF,
  onAssinar,
  baixandoPDF,
  assinando,
}) {
  if (!relatorio) return null;

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-visualizar-relatorio"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header">
          <h3>Visualizar Relatório</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body relatorio-visualizacao">
          <div className="relatorio-header">
            <h2>{relatorio.title}</h2>
            <div className="relatorio-meta">
              <p>
                <strong>Data de criação:</strong>{" "}
                {formatarData(relatorio.createdAt)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    relatorio.status === "rascunho"
                      ? "status-pendente"
                      : "status-finalizado"
                  }`}
                >
                  {relatorio.status === "rascunho" ? "Rascunho" : "Finalizado"}
                </span>
              </p>
              {relatorio.signed && (
                <p className="relatorio-assinado-info">
                  <CheckCircle2 size={16} className="mr-1" />
                  <strong>Assinado em:</strong>{" "}
                  {formatarData(relatorio.signedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="relatorio-section">
            <h3>Conteúdo</h3>
            <div className="relatorio-content">{relatorio.content}</div>
          </div>

          {relatorio.methodology && (
            <div className="relatorio-section">
              <h3>Metodologia</h3>
              <div className="relatorio-content">{relatorio.methodology}</div>
            </div>
          )}

          {relatorio.conclusion && (
            <div className="relatorio-section">
              <h3>Conclusão</h3>
              <div className="relatorio-content">{relatorio.conclusion}</div>
            </div>
          )}
        </div>

        <div className="evidencia-modal-footer">
          <button
            className="btn-baixar-pdf-modal"
            onClick={() => onBaixarPDF(relatorio._id || relatorio.id)}
            disabled={baixandoPDF}
          >
            {baixandoPDF ? (
              <>
                <Loader size={16} className="spinner" />
                <span>Baixando PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Baixar PDF</span>
              </>
            )}
          </button>

          {!relatorio.signed && (
            <button
              className="btn-assinar-modal"
              onClick={() => onAssinar(relatorio._id || relatorio.id)}
              disabled={assinando}
            >
              {assinando ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Assinando...</span>
                </>
              ) : (
                <>
                  <FileCheck size={16} />
                  <span>Assinar Relatório</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
