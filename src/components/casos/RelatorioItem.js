"use client";

import { Download, CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import ModalExcluirRelatorio from "./ModalExcluirRelatorio";

export default function RelatorioItem({
  relatorio,
  onBaixarPDF,
  baixandoPDF,
  onAssinar,
  assinando,
  onExcluir,
}) {
  const [excluindo, setExcluindo] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const relatorioId = relatorio._id || relatorio.id;

  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "--";

    const data = new Date(dataISO);
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000
    );

    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    switch (status?.toLowerCase()) {
      case "assinado":
        return "status-finalizado";
      case "finalizado":
        return "status-em-andamento";
      case "rascunho":
        return "status-pendente";
      default:
        return "status-outro";
    }
  };

  // Verificar se o relatório está assinado
  const estaAssinado =
    relatorio.status?.toLowerCase() === "assinado" ||
    relatorio.status?.toLowerCase() === "finalizado" ||
    !!relatorio.digitalSignature ||
    !!relatorio.signed;

  // Função para abrir o modal de exclusão
  const abrirModalExcluir = () => {
    // Verificar se o relatório está assinado antes de abrir o modal
    if (estaAssinado) {
      alert("Não é possível excluir um relatório assinado ou finalizado.");
      return;
    }
    setModalExcluirAberto(true);
  };

  // Função para fechar o modal de exclusão
  const fecharModalExcluir = () => {
    setModalExcluirAberto(false);
  };

  // Função para excluir relatório
  const excluirRelatorio = async () => {
    // Verificação adicional antes de tentar excluir
    if (estaAssinado) {
      alert("Não é possível excluir um relatório assinado ou finalizado.");
      fecharModalExcluir();
      return;
    }

    setExcluindo(true);
    try {
      console.log(`Solicitando exclusão do relatório ID: ${relatorioId}`);
      await onExcluir(relatorioId);
      // A atualização da UI será feita pelo componente pai
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      alert(`Não foi possível excluir o relatório. ${error.message}`);
    } finally {
      setExcluindo(false);
      fecharModalExcluir(); // Garantir que o modal feche mesmo em caso de erro
    }
  };

  // Atualizar a função para exibir o status corretamente
  const formatarStatus = (status) => {
    if (!status) return "Rascunho";

    const statusLower = status.toLowerCase();
    const statusMap = {
      rascunho: "Rascunho",
      finalizado: "Finalizado",
      assinado: "Assinado",
      "em andamento": "Em Andamento",
      "em-andamento": "Em Andamento",
      pendente: "Pendente",
      arquivado: "Arquivado",
      cancelado: "Cancelado",
    };

    return (
      statusMap[statusLower] || status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  return (
    <>
      <div className="relatorio-item">
        <div className="relatorio-info">
          <h3>{relatorio.title || "Relatório"}</h3>
          <p>Criado em: {formatarData(relatorio.createdAt)}</p>
          <p>Status: {formatarStatus(relatorio.status)}</p>
        </div>
        <div className="relatorio-acoes">
          {!estaAssinado && (
            <button
              className="btn-acao btn-assinar"
              onClick={() => onAssinar(relatorioId)}
              disabled={assinando === true || assinando[relatorioId] === true}
              title="Assinar Relatório"
            >
              {assinando === true || assinando[relatorioId] === true ? (
                <span className="spinner"></span>
              ) : (
                <CheckCircle size={16} />
              )}
            </button>
          )}
          <button
            className="btn-acao"
            onClick={() => onBaixarPDF(relatorioId)}
            disabled={baixandoPDF === true || baixandoPDF[relatorioId] === true}
            title="Baixar PDF"
          >
            {baixandoPDF === true || baixandoPDF[relatorioId] === true ? (
              <span className="spinner"></span>
            ) : (
              <Download size={16} />
            )}
          </button>
          <button
            className="btn-acao btn-excluir"
            onClick={abrirModalExcluir}
            disabled={excluindo || estaAssinado}
            title={
              estaAssinado
                ? "Não é possível excluir relatórios assinados"
                : "Excluir Relatório"
            }
          >
            {excluindo ? (
              <span className="spinner"></span>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <ModalExcluirRelatorio
        isOpen={modalExcluirAberto}
        onClose={fecharModalExcluir}
        onConfirm={excluirRelatorio}
        relatorioId={relatorioId}
        relatorioTitulo={relatorio.title}
      />
    </>
  );
}
