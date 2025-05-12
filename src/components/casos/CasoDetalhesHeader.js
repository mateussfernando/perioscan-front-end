"use client";

import { Pencil, Trash2, ArrowLeft } from "lucide-react";

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
      <div className="header-actions-minimalista">
        <button className="btn-minimalista" onClick={onEditar}>
          <Pencil size={24} strokeWidth={1.5} />
          <span>Editar</span>
        </button>
        <button
          className="btn-minimalista btn-excluir-minimalista"
          onClick={onExcluir}
          disabled={!podeExcluir}
        >
          <Trash2 size={24} strokeWidth={1.5} />
          <span>Excluir</span>
        </button>
        <button
          className="btn-minimalista btn-voltar-minimalista"
          onClick={onVoltar}
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
          <span>Voltar</span>
        </button>
      </div>
    </div>
  );
}
