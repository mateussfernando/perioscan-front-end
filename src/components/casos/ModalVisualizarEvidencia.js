"use client";

import { X, FileDown, ClipboardList, Loader } from "lucide-react";

export default function ModalVisualizarEvidencia({
  evidenciaAtiva,
  temLaudo,
  laudoId,
  baixandoPDF,
  gerandoLaudo,
  onFechar,
  onCriarLaudo,
  onBaixarPDF,
}) {
  if (!evidenciaAtiva) return null;

  const evidenciaId = evidenciaAtiva._id || evidenciaAtiva.id;

  const renderizarConteudoEvidencia = () => {
    if (evidenciaAtiva.type === "image") {
      return (
        <div className="evidencia-imagem-container">
          <img
            src={evidenciaAtiva.imageUrl || "/placeholder.svg"}
            alt={evidenciaAtiva.description || "Imagem da evidência"}
            className="evidencia-imagem"
          />
          {evidenciaAtiva.description && (
            <p className="evidencia-descricao">{evidenciaAtiva.description}</p>
          )}
        </div>
      );
    } else {
      // Tipo texto ou outro
      // Verificar se collectedBy é um objeto ou uma string
      const collectedBy =
        typeof evidenciaAtiva.collectedBy === "object" &&
        evidenciaAtiva.collectedBy !== null
          ? evidenciaAtiva.collectedBy.name || "Usuário desconhecido"
          : evidenciaAtiva.collectedBy || "Usuário desconhecido";

      return (
        <div className="evidencia-texto-container">
          <h3>{evidenciaAtiva.description || "Evidência de texto"}</h3>
          <div className="evidencia-texto-content">
            {evidenciaAtiva.content || "Sem conteúdo disponível"}
          </div>
          <p className="evidencia-info">
            <strong>Coletado em:</strong>{" "}
            {formatarData(evidenciaAtiva.collectionDate)}
            {collectedBy && (
              <span>
                {" "}
                por <strong>{collectedBy}</strong>
              </span>
            )}
          </p>
        </div>
      );
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header">
          <h3>
            {evidenciaAtiva.type === "image"
              ? "Visualizar Imagem"
              : "Visualizar Texto"}
          </h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>
        <div className="evidencia-modal-body">
          {renderizarConteudoEvidencia()}
        </div>
        <div className="evidencia-modal-footer">
          {temLaudo ? (
            <button
              className="btn-baixar-pdf-modal"
              onClick={() => onBaixarPDF(evidenciaId, laudoId)}
              disabled={baixandoPDF[laudoId]}
            >
              {baixandoPDF[laudoId] ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Baixando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  <span>Baixar PDF do Laudo</span>
                </>
              )}
            </button>
          ) : (
            <button
              className="btn-criar-laudo-modal"
              onClick={() => onCriarLaudo(evidenciaAtiva)}
              disabled={gerandoLaudo[evidenciaId]}
            >
              {gerandoLaudo[evidenciaId] ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Criando laudo...</span>
                </>
              ) : (
                <>
                  <ClipboardList size={16} />
                  <span>Criar Laudo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
