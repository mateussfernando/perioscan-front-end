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

        {/* Tabs de alternância */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: 20 }}>
          <button
            type="button"
            className={abaAtiva === 'caso' ? 'tab-btn active' : 'tab-btn'}
            style={{ flex: 1, padding: 10, border: 'none', background: abaAtiva === 'caso' ? '#f0f0f0' : 'white', fontWeight: abaAtiva === 'caso' ? 'bold' : 'normal', cursor: 'pointer' }}
            onClick={() => setAbaAtiva('caso')}
          >
            Editar Caso
          </button>
          <button
            type="button"
            className={abaAtiva === 'vitima' ? 'tab-btn active' : 'tab-btn'}
            style={{ flex: 1, padding: 10, border: 'none', background: abaAtiva === 'vitima' ? '#f0f0f0' : 'white', fontWeight: abaAtiva === 'vitima' ? 'bold' : 'normal', cursor: 'pointer' }}
            onClick={() => setAbaAtiva('vitima')}
          >
            Editar Vítima
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-editar-caso">
            {/* Renderiza o formulário de acordo com a aba ativa */}
            {abaAtiva === 'caso' && (
              <>
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
                  <select id="status" name="status" value={casoEditado.status} onChange={onCasoChange} required>
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
              </>
            )}

            {abaAtiva === 'vitima' && (
              <div className="form-section">
                <h4>Informações da Vítima</h4>
                {/* Todos os campos abaixo são apenas para edição, não para criação */}
                <div className="form-group">
                  <label htmlFor="victim.identificationType">Tipo de Identificação</label>
                  <select
                    id="victim.identificationType"
                    name="victim.identificationType"
                    value={casoEditado.victim?.identificationType || ""}
                    onChange={handleVictimChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="identificada">Identificada</option>
                    <option value="não_identificada">Não Identificada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="victim.name">Nome da Vítima</label>
                  <input
                    type="text"
                    id="victim.name"
                    name="victim.name"
                    value={casoEditado.victim?.name || ""}
                    onChange={handleVictimChange}
                    placeholder="Nome completo da vítima"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="victim.nic">NIC (Número de Identificação Criminal)</label>
                  <input
                    type="text"
                    id="victim.nic"
                    name="victim.nic"
                    value={casoEditado.victim?.nic || ""}
                    onChange={handleVictimChange}
                    placeholder="Número de identificação criminal"
                  />
                </div>
                {casoEditado.victim?.identificationType === "não_identificada" && (
                  <div className="form-group">
                    <label htmlFor="victim.referenceCode">Código de Referência</label>
                    <input
                      type="text"
                      id="victim.referenceCode"
                      name="victim.referenceCode"
                      value={casoEditado.victim?.referenceCode || ""}
                      onChange={handleVictimChange}
                      placeholder="Código de referência para vítima não identificada"
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="victim.gender">Gênero</label>
                  <select
                    id="victim.gender"
                    name="victim.gender"
                    value={casoEditado.victim?.gender || ""}
                    onChange={handleVictimChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="indeterminado">Indeterminado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="victim.age">Idade</label>
                  <input
                    type="number"
                    id="victim.age"
                    name="victim.age"
                    value={casoEditado.victim?.age || ""}
                    onChange={handleVictimChange}
                    placeholder="Idade da vítima"
                    min="0"
                    max="150"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="victim.birthDate">Data de Nascimento</label>
                  <input
                    type="date"
                    id="victim.birthDate"
                    name="victim.birthDate"
                    value={casoEditado.victim?.birthDate ? casoEditado.victim.birthDate.substring(0, 10) : ""}
                    onChange={handleVictimChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="victim.ethnicity">Etnia</label>
                  <select
                    id="victim.ethnicity"
                    name="victim.ethnicity"
                    value={casoEditado.victim?.ethnicity || "não_declarada"}
                    onChange={handleVictimChange}
                  >
                    <option value="não_declarada">Não Declarada</option>
                    <option value="branca">Branca</option>
                    <option value="preta">Preta</option>
                    <option value="parda">Parda</option>
                    <option value="amarela">Amarela</option>
                    <option value="indígena">Indígena</option>
                    <option value="não_identificada">Não Identificada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="victim.document.type">Tipo de Documento</label>
                  <select
                    id="victim.document.type"
                    name="victim.document.type"
                    value={casoEditado.victim?.document?.type || ""}
                    onChange={handleVictimChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="cpf">CPF</option>
                    <option value="rg">RG</option>
                    <option value="cnh">CNH</option>
                    <option value="passaporte">Passaporte</option>
                    <option value="certidao_nascimento">Certidão de Nascimento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="victim.document.number">Número do Documento</label>
                  <input
                    type="text"
                    id="victim.document.number"
                    name="victim.document.number"
                    value={casoEditado.victim?.document?.number || ""}
                    onChange={handleVictimChange}
                    placeholder="Número do documento"
                    maxLength={50}
                  />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="victim.estimatedAge.min">Idade Estimada (Mín)</label>
                    <input
                      type="number"
                      id="victim.estimatedAge.min"
                      name="victim.estimatedAge.min"
                      value={casoEditado.victim?.estimatedAge?.min || ""}
                      onChange={handleVictimChange}
                      placeholder="Idade mínima"
                      min="0"
                      max="150"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="victim.estimatedAge.max">Idade Estimada (Máx)</label>
                    <input
                      type="number"
                      id="victim.estimatedAge.max"
                      name="victim.estimatedAge.max"
                      value={casoEditado.victim?.estimatedAge?.max || ""}
                      onChange={handleVictimChange}
                      placeholder="Idade máxima"
                      min="0"
                      max="150"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="victim.estimatedAge.methodology">Metodologia da Idade Estimada</label>
                  <textarea
                    id="victim.estimatedAge.methodology"
                    name="victim.estimatedAge.methodology"
                    value={casoEditado.victim?.estimatedAge?.methodology || ""}
                    onChange={handleVictimChange}
                    placeholder="Descreva a metodologia utilizada para estimar a idade"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Mensagem de erro */}
            {erroEdicao && (
              <div className="upload-error">
                <p>{erroEdicao}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onFechar} disabled={salvandoCaso}>
                Cancelar
              </button>
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
          </form>
        </div>
      </div>
    </div>
  )
}
