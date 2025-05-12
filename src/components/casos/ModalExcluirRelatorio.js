"use client";

import { X, Trash2, Loader } from "lucide-react";

export default function ModalExcluirRelatorio({
  relatorio,
  onFechar,
  onExcluir,
  excluindo,
}) {
  if (!relatorio) return null;

  // Garantir que temos um ID válido para exclusão
  const relatorioId = relatorio._id || relatorio.id;

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-excluir"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header excluir-header">
          <h3>Excluir Relatório</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>
        <div className="evidencia-modal-body">
          <div className="excluir-aviso">
            <Trash2 size={48} className="excluir-icone" />
            <p>
              Tem certeza que deseja excluir este relatório?
              <br />
              <strong>{relatorio.title || "Relatório"}</strong>
            </p>
            <p>
              <strong>Esta ação não pode ser desfeita!</strong>
            </p>
          </div>
        </div>
        <div className="evidencia-modal-footer">
          <button
            className="btn-cancelar"
            onClick={onFechar}
            disabled={excluindo}
          >
            Cancelar
          </button>
          <button
            className="btn-excluir-confirmar"
            onClick={() => onExcluir(relatorioId)}
            disabled={excluindo}
          >
            {excluindo ? (
              <>
                <Loader size={16} className="spinner" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Excluir Relatório</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
