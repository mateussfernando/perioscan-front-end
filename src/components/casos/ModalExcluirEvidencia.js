"use client";

import { X, Trash2, Loader } from "lucide-react";

export default function ModalExcluirEvidencia({
  evidencia,
  onFechar,
  onExcluir,
  excluindo,
  erro,
}) {
  if (!evidencia) return null;

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-excluir"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header excluir-header">
          <h3>Excluir Evidência</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>
        <div className="evidencia-modal-body">
          <div className="excluir-aviso">
            <Trash2 size={48} className="excluir-icone" />
            <p>
              Tem certeza que deseja excluir esta evidência?
              <br />
              <strong>{evidencia.description || `Evidência`}</strong>
            </p>
            <p>
              <strong>Esta ação não pode ser desfeita!</strong>
            </p>
          </div>
          {erro && (
            <div className="upload-error">
              <p>{erro}</p>
            </div>
          )}
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
            onClick={onExcluir}
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
                <span>Excluir Evidência</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
