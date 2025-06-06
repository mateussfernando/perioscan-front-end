"use client"

import { UserPlus } from "lucide-react"
import "../../styles/botao-adicionar-vitima.css"

export default function BotaoAdicionarVitima({ onClick, disabled }) {
  return (
    <button className="botao-adicionar-vitima" onClick={onClick} disabled={disabled}>
      <UserPlus size={18} />
      <span>Adicionar Vítima</span>
    </button>
  )
}
