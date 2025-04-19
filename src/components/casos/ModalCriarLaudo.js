"use client"

import { useState } from "react"
import { X, Loader, ClipboardList } from "lucide-react"

export default function ModalCriarLaudo({ evidencia, onFechar, onCriar, criandoLaudo, erroLaudo }) {
  const [dadosLaudo, setDadosLaudo] = useState({
    titulo: `Laudo de ${evidencia.type === "image" ? "Imagem" : "Texto"}: ${evidencia.description || ""}`,
    conteudo: "",
    achados: "",
    metodologia:
      evidencia.type === "image"
        ? evidencia.imageType === "radiografia"
          ? "Análise radiográfica digital com contraste"
          : "Análise de imagem digital"
        : "Análise documental",
  })

  const handleLaudoChange = (e) => {
    const { name, value } = e.target
    setDadosLaudo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onCriar(evidencia, dadosLaudo)
  }

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div className="evidencia-modal-content modal-criar-laudo" onClick={(e) => e.stopPropagation()}>
        <div className="evidencia-modal-header">
          <h3>Criar Laudo para Evidência</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        <div className="evidencia-modal-body">
          <form onSubmit={handleSubmit} className="form-criar-laudo">
            {/* Título do laudo */}
            <div className="form-group">
              <label htmlFor="titulo">Título do Laudo</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={dadosLaudo.titulo}
                onChange={handleLaudoChange}
                placeholder="Ex: Análise de Radiografia Mandibular"
                required
              />
            </div>

            {/* Conteúdo do laudo */}
            <div className="form-group">
              <label htmlFor="conteudo">Conteúdo do Laudo</label>
              <textarea
                id="conteudo"
                name="conteudo"
                value={dadosLaudo.conteudo}
                onChange={handleLaudoChange}
                placeholder="Descreva detalhadamente a análise da evidência..."
                rows={5}
                required
              ></textarea>
            </div>

            {/* Achados */}
            <div className="form-group">
              <label htmlFor="achados">Achados</label>
              <textarea
                id="achados"
                name="achados"
                value={dadosLaudo.achados}
                onChange={handleLaudoChange}
                placeholder="Descreva os achados principais da análise..."
                rows={3}
                required
              ></textarea>
            </div>

            {/* Metodologia */}
            <div className="form-group">
              <label htmlFor="metodologia">Metodologia</label>
              <textarea
                id="metodologia"
                name="metodologia"
                value={dadosLaudo.metodologia}
                onChange={handleLaudoChange}
                placeholder="Descreva a metodologia utilizada na análise..."
                rows={2}
                required
              ></textarea>
            </div>

            {/* Mensagem de erro */}
            {erroLaudo && (
              <div className="upload-error">
                <p>{erroLaudo}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onFechar} disabled={criandoLaudo}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar" disabled={criandoLaudo}>
                {criandoLaudo ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <ClipboardList size={16} />
                    <span>Criar Laudo</span>
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
