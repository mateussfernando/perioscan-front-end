"use client"

import { useState, useRef } from "react"
import { X, Upload, Plus, Camera, FileText, Loader } from "lucide-react"

export default function ModalAdicionarEvidencia({ onFechar, onEnviar, enviandoEvidencia }) {
  const [tipoEvidencia, setTipoEvidencia] = useState("image") // "image" ou "text"
  const [descricaoEvidencia, setDescricaoEvidencia] = useState("")
  const [conteudoTexto, setConteudoTexto] = useState("")
  const [imagemSelecionada, setImagemSelecionada] = useState(null)
  const [previewImagem, setPreviewImagem] = useState(null)
  const [tipoImagem, setTipoImagem] = useState("radiografia")
  const [erroUpload, setErroUpload] = useState(null)

  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Verificar o tamanho do arquivo (50MB = 50 * 1024 * 1024 bytes)
    if (file.size > 50 * 1024 * 1024) {
      setErroUpload("O arquivo é muito grande. O tamanho máximo permitido é 50MB.")
      return
    }

    setImagemSelecionada(file)

    // Criar preview da imagem
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImagem(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const dadosEvidencia = {
      tipoEvidencia,
      descricaoEvidencia,
      conteudoTexto,
      imagemSelecionada,
      tipoImagem,
    }

    onEnviar(e, dadosEvidencia)
  }

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div className="evidencia-modal-content modal-adicionar" onClick={(e) => e.stopPropagation()}>
        <div className="evidencia-modal-header">
          <h3>Adicionar Nova Evidência</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-adicionar-evidencia">
            {/* Seleção de tipo de evidência */}
            <div className="tipo-evidencia-selector">
              <button
                type="button"
                className={`tipo-btn ${tipoEvidencia === "image" ? "active" : ""}`}
                onClick={() => setTipoEvidencia("image")}
              >
                <Camera size={20} />
                <span>Imagem</span>
              </button>
              <button
                type="button"
                className={`tipo-btn ${tipoEvidencia === "text" ? "active" : ""}`}
                onClick={() => setTipoEvidencia("text")}
              >
                <FileText size={20} />
                <span>Texto</span>
              </button>
            </div>

            {/* Campo de descrição (comum para ambos os tipos) */}
            <div className="form-group">
              <label htmlFor="descricao">Descrição da Evidência</label>
              <input
                type="text"
                id="descricao"
                value={descricaoEvidencia}
                onChange={(e) => setDescricaoEvidencia(e.target.value)}
                placeholder="Ex: Radiografia panorâmica da vítima"
                required
              />
            </div>

            {/* Campos específicos para cada tipo de evidência */}
            {tipoEvidencia === "image" ? (
              <>
                {/* Tipo de imagem (novo campo) */}
                <div className="form-group">
                  <label htmlFor="tipoImagem">Tipo de Imagem</label>
                  <select id="tipoImagem" value={tipoImagem} onChange={(e) => setTipoImagem(e.target.value)} required>
                    <option value="radiografia">Radiografia</option>
                    <option value="fotografia">Fotografia</option>
                    <option value="tomografia">Tomografia</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                {/* Área de upload */}
                <div className="form-group upload-container">
                  <label>Imagem (máx. 50MB)</label>
                  <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                    {previewImagem ? (
                      <div className="preview-container">
                        <img src={previewImagem || "/placeholder.svg"} alt="Preview" className="image-preview" />
                        <button
                          type="button"
                          className="remove-preview"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImagemSelecionada(null)
                            setPreviewImagem(null)
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={40} />
                        <p>Clique para selecionar ou arraste uma imagem</p>
                        <span className="upload-hint">JPG, PNG ou GIF até 50MB</span>
                      </>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label htmlFor="conteudo">Conteúdo do Texto</label>
                <textarea
                  id="conteudo"
                  value={conteudoTexto}
                  onChange={(e) => setConteudoTexto(e.target.value)}
                  placeholder="Insira o conteúdo textual da evidência aqui..."
                  rows={6}
                  required
                ></textarea>
              </div>
            )}

            {/* Mensagem de erro */}
            {erroUpload && (
              <div className="upload-error">
                <p>{erroUpload}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onFechar} disabled={enviandoEvidencia}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar" disabled={enviandoEvidencia}>
                {enviandoEvidencia ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Adicionar Evidência</span>
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
