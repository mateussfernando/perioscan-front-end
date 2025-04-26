"use client";

import { X, Save, Loader } from "lucide-react";

export default function ModalEditarRelatorio({
  relatorio,
  onFechar,
  onSalvar,
  onChange,
  editando,
  erro,
}) {
  if (!relatorio) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(e);
  };

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-criar-relatorio"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header">
          <h3>Editar Relatório</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-criar-relatorio">
            {/* Título do relatório */}
            <div className="form-group">
              <label htmlFor="title">Título do Relatório</label>
              <input
                type="text"
                id="title"
                name="title"
                value={relatorio.title}
                onChange={onChange}
                placeholder="Ex: Relatório de Análise Odontológica"
                required
              />
            </div>

            {/* Conteúdo do relatório */}
            <div className="form-group">
              <label htmlFor="content">Conteúdo do Relatório</label>
              <textarea
                id="content"
                name="content"
                value={relatorio.content}
                onChange={onChange}
                placeholder="Descreva detalhadamente a análise do caso..."
                rows={8}
                required
              ></textarea>
            </div>

            {/* Metodologia */}
            <div className="form-group">
              <label htmlFor="methodology">Metodologia</label>
              <textarea
                id="methodology"
                name="methodology"
                value={relatorio.methodology}
                onChange={onChange}
                placeholder="Descreva a metodologia utilizada..."
                rows={4}
              ></textarea>
            </div>

            {/* Conclusão */}
            <div className="form-group">
              <label htmlFor="conclusion">Conclusão</label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={relatorio.conclusion}
                onChange={onChange}
                placeholder="Descreva a conclusão da análise..."
                rows={4}
              ></textarea>
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={relatorio.status}
                onChange={onChange}
              >
                <option value="rascunho">Rascunho</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <p className="status-info">
                <strong>Nota:</strong> Apenas relatórios com status Finalizado
                podem ser assinados.
              </p>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="upload-error">
                <p>{erro}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onFechar}
                disabled={editando}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-salvar" disabled={editando}>
                {editando ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
