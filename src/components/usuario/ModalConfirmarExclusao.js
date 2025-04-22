"use client";

import { useState } from "react";
import "../../styles/modal-confirmar-exclusao.css";

export default function ModalConfirmarExclusao({
  usuario,
  onClose,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      // Se chegou aqui, a exclusão foi bem-sucedida
    } catch (error) {
      console.error("Erro durante a exclusão:", error);
      // Mostrar um alerta com o erro
      alert(`Erro ao excluir usuário: ${error.message || "Falha na operação"}`);
      // O erro já será tratado na função onConfirm
    } finally {
      setLoading(false);
      // Fechar o modal mesmo em caso de erro para evitar que o usuário fique preso
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-exclusao">
        <div className="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p>
            Tem certeza que deseja excluir o usuário{" "}
            <strong>{usuario?.name || "selecionado"}</strong>?
          </p>
          <p className="aviso">Esta ação não pode ser desfeita.</p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="delete-button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
