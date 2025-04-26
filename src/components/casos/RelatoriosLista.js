"use client";

import {
  Eye,
  Download,
  FileCheck,
  Trash2,
  Loader,
  FilePlus,
  Pencil,
} from "lucide-react";

export default function RelatoriosLista({
  relatorios,
  carregandoRelatorios,
  baixandoPDFRelatorio,
  assinandoRelatorio,
  onVerRelatorio,
  onBaixarPDF,
  onAssinar,
  onExcluir,
  onCriarRelatorio,
  onEditarRelatorio,
  formatarData,
}) {
  return (
    <div className="relatorios-section">
      <h2>Relatórios</h2>
      {carregandoRelatorios ? (
        <div className="loading-relatorios">Carregando relatórios...</div>
      ) : (
        <>
          <div className="relatorios-tabela">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Data de Criação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {relatorios.length > 0 ? (
                  relatorios.map((relatorio) => (
                    <tr
                      key={relatorio._id || relatorio.id}
                      className="relatorio-row"
                    >
                      <td onClick={() => onVerRelatorio(relatorio)}>
                        <div className="relatorio-info-cell">
                          <span className="relatorio-titulo">
                            {relatorio.title}
                          </span>
                          {relatorio.signed && (
                            <span className="relatorio-assinado">
                              <FileCheck size={14} /> Assinado
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            relatorio.status === "rascunho"
                              ? "status-pendente"
                              : "status-finalizado"
                          }`}
                        >
                          {relatorio.status === "rascunho"
                            ? "Rascunho"
                            : "Finalizado"}
                        </span>
                      </td>
                      <td>{formatarData(relatorio.createdAt)}</td>
                      <td className="acoes-cell">
                        <button
                          className="btn-ver-caso"
                          onClick={() => onVerRelatorio(relatorio)}
                          title="Ver relatório"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-editar-relatorio"
                          onClick={() => onEditarRelatorio(relatorio)}
                          title="Editar relatório"
                          disabled={relatorio.signed}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-baixar-pdf"
                          onClick={() =>
                            onBaixarPDF(relatorio._id || relatorio.id)
                          }
                          disabled={baixandoPDFRelatorio}
                          title="Baixar PDF do relatório"
                        >
                          {baixandoPDFRelatorio ? (
                            <Loader size={18} className="spinner" />
                          ) : (
                            <Download size={18} />
                          )}
                        </button>
                        {!relatorio.signed && (
                          <button
                            className={`btn-assinar ${
                              relatorio.status !== "finalizado"
                                ? "btn-disabled"
                                : ""
                            }`}
                            onClick={() =>
                              onAssinar(relatorio._id || relatorio.id)
                            }
                            disabled={
                              assinandoRelatorio ||
                              relatorio.status !== "finalizado"
                            }
                            title={
                              relatorio.status !== "finalizado"
                                ? "Apenas relatórios finalizados podem ser assinados"
                                : "Assinar relatório"
                            }
                          >
                            {assinandoRelatorio ? (
                              <Loader size={18} className="spinner" />
                            ) : (
                              <FileCheck size={18} />
                            )}
                          </button>
                        )}
                        {!relatorio.signed && (
                          <button
                            className="btn-excluir-relatorio"
                            onClick={() => onExcluir(relatorio)}
                            title="Excluir relatório"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-relatorios">
                      Nenhum relatório registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn-adicionar" onClick={onCriarRelatorio}>
            <FilePlus size={16} className="mr-2" />
            Criar Relatório
          </button>
        </>
      )}
    </div>
  );
}
