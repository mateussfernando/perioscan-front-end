"use client"

import { X, AlertCircle, FileDown } from "lucide-react"

export default function NotificacaoLaudo({ notificacao, onFechar }) {
  if (!notificacao.visible) return null

  return (
    <div className={`notificacao-laudo ${notificacao.type}`}>
      {notificacao.type === "error" ? <AlertCircle size={18} /> : <FileDown size={18} />}
      <span>{notificacao.message}</span>
      <button className="fechar-notificacao" onClick={onFechar}>
        <X size={16} />
      </button>
    </div>
  )
}
