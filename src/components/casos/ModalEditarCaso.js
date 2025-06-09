"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Save, Loader, Calendar } from "lucide-react"

export default function ModalEditarCaso({ casoEditado, onFechar, onSalvar, onCasoChange, salvandoCaso, erroEdicao }) {
  const [tipoPersonalizado, setTipoPersonalizado] = useState("")
  const [abaAtiva, setAbaAtiva] = useState("caso") // 'caso' ou 'vitima'

  // Inicializar o tipo personalizado se o tipo não for um dos padrões
  useEffect(() => {
    const tiposPadrao = ["acidente", "identificação de vítima", "exame criminal", "outro"]
    if (casoEditado?.type && !tiposPadrao.includes(casoEditado.type)) {
      setTipoPersonalizado(casoEditado.type)
    }

    // Inicializar campos da vítima se não existirem
    if (!casoEditado?.victim) {
      casoEditado.victim = {
        nic: "",
        name: "",
        gender: "",
        age: "",
        birthDate: "",
        estimatedAge: {
          min: "",
          max: "",
          methodology: "",
        },
        document: {
          type: "",
          number: "",
        },
        ethnicity: "não_declarada",
        identificationType: "",
        referenceCode: "",
      }
    }
  }, [
    casoEditado.type,
    casoEditado.victim?.age,
    casoEditado.victim?.birthDate,
    casoEditado.victim?.document?.number,
    casoEditado.victim?.document?.type,
    casoEditado.victim?.estimatedAge?.max,
    casoEditado.victim?.estimatedAge?.methodology,
    casoEditado.victim?.estimatedAge?.min,
    casoEditado.victim?.ethnicity,
    casoEditado.victim?.gender,
    casoEditado.victim?.identificationType,
    casoEditado.victim?.name,
    casoEditado.victim?.nic,
    casoEditado,
  ])

  const handleSubmit = (e) => {
    e.preventDefault()

    const casoParaEnviar = { ...casoEditado }

    // Se o tipo for "outro" e houver um valor personalizado, use-o como tipo
    if (casoEditado.type === "outro" && tipoPersonalizado.trim()) {
      casoParaEnviar.type = tipoPersonalizado.trim()
    }

    // Chamar onSalvar com o evento e o caso modificado
    onSalvar(e, casoParaEnviar)
  }

  const handleTipoPersonalizadoChange = (e) => {
    setTipoPersonalizado(e.target.value)
  }

  const handleVictimChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("victim.")) {
      const fieldPath = name.split(".")
      onCasoChange({
        target: {
          name: "victim",
          value: {
            ...casoEditado.victim,
            [fieldPath[1]]:
              fieldPath.length === 3
                ? {
                    ...casoEditado.victim[fieldPath[1]],
                    [fieldPath[2]]: value,
                  }
                : value,
          },
        },
      })
    }
  }

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div className="evidencia-modal-content modal-editar" onClick={(e) => e.stopPropagation()}>
        <div className="evidencia-modal-header">
          <h3>Editar Caso</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-editar-caso">
            {/* Formulário de edição do caso apenas */}
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
              <select id="type" name="type" value={casoEditado.type || "outro"} onChange={onCasoChange}>
                <option value="acidente">Acidente</option>
                <option value="identificação de vítima">Identificação de Vítima</option>
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
                value={casoEditado.occurrenceDate ? casoEditado.occurrenceDate.substring(0, 10) : ""}
                onChange={onCasoChange}
              />
            </div>
            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={casoEditado.status || "em andamento"} onChange={onCasoChange}>
                <option value="em andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
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
                placeholder="Descreva o caso..."
                rows={4}
              />
            </div>
            {/* Botão de salvar */}
            <div className="form-actions">
              <button type="submit" className="btn-salvar" disabled={salvandoCaso}>
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
            {erroEdicao && <div className="erro-edicao">{erroEdicao}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
