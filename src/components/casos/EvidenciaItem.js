"use client"
import { Eye, FileDown, ClipboardList, Loader } from "lucide-react"

export default function EvidenciaItem({
  evidencia,
  index,
  temLaudo,
  laudoId,
  baixandoPDF,
  gerandoLaudo,
  onVerEvidencia,
  onCriarLaudo,
  onBaixarPDF,
}) {
  const evidenciaId = evidencia._id || evidencia.id

  // Formatar data para exibição
  const formatarData = (dataISO) => {
    if (!dataISO) return "--"
    const data = new Date(dataISO)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <tr className="evidencia-row">
      <td onClick={() => onVerEvidencia(evidencia)}>
        <div className="evidencia-info-cell">
          <span className="evidencia-titulo">{evidencia.description || `Evidência ${index + 1}`}</span>
          <span className="evidencia-data">{formatarData(evidencia.createdAt || evidencia.collectionDate)}</span>
        </div>
      </td>
      <td onClick={() => onVerEvidencia(evidencia)}>
        <span className={`evidencia-tipo ${evidencia.type === "image" ? "tipo-imagem" : "tipo-texto"}`}>
          {evidencia.type === "image" ? "Imagem" : "Texto"}
        </span>
      </td>
      <td className="acoes-cell">
        <button className="btn-ver-caso" onClick={() => onVerEvidencia(evidencia)} title="Ver detalhes">
          <Eye size={18} />
        </button>

        {temLaudo ? (
          <button
            className="btn-baixar-pdf"
            onClick={() => onBaixarPDF(evidenciaId, laudoId)}
            disabled={baixandoPDF[laudoId]}
            title="Baixar PDF do laudo"
          >
            {baixandoPDF[laudoId] ? <Loader size={18} className="spinner" /> : <FileDown size={18} />}
            <span className="btn-text">PDF</span>
          </button>
        ) : (
          <button
            className="btn-criar-laudo"
            onClick={() => onCriarLaudo(evidencia)}
            disabled={gerandoLaudo[evidenciaId]}
            title="Criar laudo"
          >
            {gerandoLaudo[evidenciaId] ? <Loader size={18} className="spinner" /> : <ClipboardList size={18} />}
            <span className="btn-text">Laudo</span>
          </button>
        )}
      </td>
    </tr>
  )
}
