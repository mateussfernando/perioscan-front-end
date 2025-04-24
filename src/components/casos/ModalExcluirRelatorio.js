"use client";

import { useState } from "react";
import "../../styles/modal-excluir-relatorio.css";

export default function ModalExcluirRelatorio({
  isOpen,
  onClose,
  onConfirm,
  relatorioId,
  relatorioTitulo,
}) {
  const [excluindo, setExcluindo] = useState(false);

  const handleConfirm = async () => {
    setExcluindo(true);
    try {
      await onConfirm(relatorioId);
      onClose();
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
    } finally {
      setExcluindo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-excluir-relatorio">
        <div className="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button className="btn-fechar" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            Tem certeza que deseja excluir o relatório{" "}
            <strong>{relatorioTitulo || "selecionado"}</strong>?
          </p>
          <p className="aviso-exclusao">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={excluindo}
          >
            Cancelar
          </button>
          <button
            className="btn-excluir"
            onClick={handleConfirm}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
