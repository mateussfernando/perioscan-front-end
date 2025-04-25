"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Save, Loader, Calendar } from "lucide-react";

export default function ModalEditarCaso({
  casoEditado,
  onFechar,
  onSalvar,
  onCasoChange,
  salvandoCaso,
  erroEdicao,
}) {
  const [tipoPersonalizado, setTipoPersonalizado] = useState("");

  // Inicializar o tipo personalizado se o tipo não for um dos padrões
  useEffect(() => {
    const tiposPadrao = [
      "acidente",
      "identificação de vítima",
      "exame criminal",
      "outro",
    ];
    if (casoEditado.type && !tiposPadrao.includes(casoEditado.type)) {
      setTipoPersonalizado(casoEditado.type);
    }
  }, [casoEditado.type]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Se o tipo for "outro" e houver um valor personalizado, use-o como tipo
    if (casoEditado.type === "outro" && tipoPersonalizado.trim()) {
      const casoComTipoPersonalizado = {
        ...casoEditado,
        type: tipoPersonalizado.trim(),
      };

      // Chamar onSalvar com o evento e o caso modificado
      onSalvar(e, casoComTipoPersonalizado);
    } else {
      onSalvar(e);
    }
  };

  const handleTipoPersonalizadoChange = (e) => {
    setTipoPersonalizado(e.target.value);
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

            {/* Tipo do caso */}
            <div className="form-group">
              <label htmlFor="type">Tipo do Caso</label>
              <select
                id="type"
                name="type"
                value={casoEditado.type || "outro"}
                onChange={onCasoChange}
              >
                <option value="acidente">Acidente</option>
                <option value="identificação de vítima">
                  Identificação de Vítima
                </option>
                <option value="exame criminal">Exame Criminal</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {/* Campo para tipo personalizado - aparece apenas quando "outro" está selecionado */}
            {casoEditado.type === "outro" && (
              <div className="form-group">
                <label htmlFor="tipoPersonalizado">Especifique o Tipo</label>
                <input
                  type="text"
                  id="tipoPersonalizado"
                  name="tipoPersonalizado"
                  value={tipoPersonalizado}
                  onChange={handleTipoPersonalizadoChange}
                  placeholder="Digite o tipo específico do caso"
                />
              </div>
            )}

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
                <option value="arquivado">Arquivado</option>
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
