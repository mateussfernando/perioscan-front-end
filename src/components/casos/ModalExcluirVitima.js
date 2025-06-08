import { X, Trash, Loader } from "lucide-react";
import "../../styles/modal-adicionar-vitima.css";

export default function ModalExcluirVitima({ vitima, onFechar, onExcluir, excluindo, erro }) {
  if (!vitima) return null;
  return (
    <div className="vitima-modal-overlay" onClick={onFechar}>
      <div className="vitima-modal-content" onClick={e => e.stopPropagation()}>
        <div className="vitima-modal-header" style={{background: '#a52e40', color: 'white'}}>
          <h3><Trash size={20} style={{marginRight: 8}}/>Excluir Vítima</h3>
          <button className="btn-fechar-modal" onClick={onFechar} style={{color: 'white'}}>
            <X size={20} />
          </button>
        </div>
        <div className="vitima-modal-body">
          <p>Tem certeza que deseja excluir a vítima <strong>{vitima.name || 'Sem nome'}</strong>?</p>
          {erro && (
            <div className="upload-error">
              <p>{erro}</p>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onFechar} disabled={excluindo}>
              Cancelar
            </button>
            <button type="button" className="btn-salvar" style={{background: '#a52e40'}} onClick={onExcluir} disabled={excluindo}>
              {excluindo ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash size={16} />
                  <span>Excluir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 