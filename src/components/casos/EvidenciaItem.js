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

  return (
    <tr className="evidencia-row">
      <td onClick={() => onVerEvidencia(evidencia)}>{evidencia.description || `Evidência ${index + 1}`}</td>
      <td onClick={() => onVerEvidencia(evidencia)}>{evidencia.type === "image" ? "Imagem" : "Texto"}</td>
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
          </button>
        ) : (
          <button
            className="btn-criar-laudo"
            onClick={() => onCriarLaudo(evidencia)}
            disabled={gerandoLaudo[evidenciaId]}
            title="Criar laudo"
          >
            {gerandoLaudo[evidenciaId] ? <Loader size={18} className="spinner" /> : <ClipboardList size={18} />}
          </button>
        )}
      </td>
    </tr>
  )
}
