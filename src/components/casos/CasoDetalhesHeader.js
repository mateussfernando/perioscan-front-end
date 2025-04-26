"use client";

import { Pencil, Trash2 } from "lucide-react";

export default function CasoDetalhesHeader({
  caso,
  onEditar,
  onExcluir,
  onVoltar,
  podeExcluir,
}) {
  return (
    <div className="caso-card-header">
      <h1>{caso.title}</h1>
      <div className="header-actions">
        <button className="btn-editar" onClick={onEditar}>
          <Pencil size={16} />
          Editar Caso
        </button>
        <button
          className="btn-excluir"
          onClick={onExcluir}
          disabled={!podeExcluir}
        >
          <Trash2 size={16} />
          Excluir
        </button>
        <button className="btn-voltar" onClick={onVoltar}>
          Voltar
        </button>
      </div>
    </div>
  );
}
