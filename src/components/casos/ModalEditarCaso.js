"use client";

import { X, MapPin, Save, Loader, Calendar } from "lucide-react";

export default function ModalEditarCaso({
  casoEditado,
  onFechar,
  onSalvar,
  onCasoChange,
  salvandoCaso,
  erroEdicao,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(e);
  };

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-editar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header">
          <h3>Editar Caso</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-editar-caso">
            {/* Título do caso */}
            <div className="form-group">
              <label htmlFor="title">
                <span>Título do Caso</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={casoEditado.title}
                onChange={onCasoChange}
                placeholder="Ex: Identificação de Vítima em Incêndio"
                required
              />
            </div>

            {/* Local */}
            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                <span>Local</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={casoEditado.location}
                onChange={onCasoChange}
                placeholder="Ex: Belo Horizonte, MG"
              />
            </div>

            {/* Data da Ocorrência */}
            <div className="form-group">
              <label htmlFor="occurrenceDate">
                <Calendar size={16} />
                <span>Data da Ocorrência</span>
              </label>
              <input
                type="date"
                id="occurrenceDate"
                name="occurrenceDate"
                value={
                  casoEditado.occurrenceDate
                    ? casoEditado.occurrenceDate.substring(0, 10)
                    : ""
                }
                onChange={onCasoChange}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={casoEditado.status}
                onChange={onCasoChange}
                required
              >
                <option value="em andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
                <option value="pendente">Pendente</option>
                <option value="arquivado">Arquivado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={casoEditado.description}
                onChange={onCasoChange}
                placeholder="Descreva os detalhes do caso..."
                rows={6}
              ></textarea>
            </div>

            {/* Observação */}
            <div className="form-group">
              <label htmlFor="observation">Observação</label>
              <textarea
                id="observation"
                name="observation"
                value={casoEditado.observation}
                onChange={onCasoChange}
                placeholder="Adicione observações relevantes..."
                rows={3}
              ></textarea>
            </div>

            {/* Mensagem de erro */}
            {erroEdicao && (
              <div className="upload-error">
                <p>{erroEdicao}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onFechar}
                disabled={salvandoCaso}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-salvar"
                disabled={salvandoCaso}
              >
                {salvandoCaso ? (
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
