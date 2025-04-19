"use client"

import { X, Trash2, Loader } from "lucide-react"

export default function ModalExcluirCaso({ onFechar, onExcluir, excluindoCaso, erroExclusao }) {
  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div className="evidencia-modal-content modal-excluir" onClick={(e) => e.stopPropagation()}>
        <div className="evidencia-modal-header excluir-header">
          <h3>Excluir Caso</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <div className="excluir-aviso">
            <Trash2 size={48} className="excluir-icone" />
            <p>
              Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita e todas as evidências associadas
              também serão excluídas.
            </p>
          </div>

          {/* Mensagem de erro */}
          {erroExclusao && (
            <div className="upload-error">
              <p>{erroExclusao}</p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onFechar} disabled={excluindoCaso}>
              Cancelar
            </button>
            <button type="button" className="btn-excluir-confirmar" onClick={onExcluir} disabled={excluindoCaso}>
              {excluindoCaso ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Confirmar Exclusão</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
