"use client";

import EvidenciaItem from "./EvidenciaItem";
import EvidenciasFiltro from "./EvidenciasFiltro";

export default function EvidenciasLista({
  evidencias,
  evidenciasFiltradas,
  loadingEvidencias,
  laudosEvidencias,
  baixandoPDF,
  gerandoLaudo,
  onSearch,
  onFilter,
  onVerEvidencia,
  onCriarLaudo,
  onBaixarPDF,
  onExcluirEvidencia,
  onAdicionarEvidencia,
}) {
  return (
    <div className="evidencias-section">
      <h2>Evidências</h2>
      {loadingEvidencias ? (
        <div className="loading-evidencias">Carregando evidências...</div>
      ) : (
        <>
          <EvidenciasFiltro onSearch={onSearch} onFilter={onFilter} />
          <div className="evidencias-tabela">
            <table>
              <thead>
                <tr>
                  <th>Nome/Descrição</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {evidenciasFiltradas.length > 0 ? (
                  evidenciasFiltradas.map((evidencia, index) => {
                    const evidenciaId = evidencia._id || evidencia.id;
                    const temLaudo = !!laudosEvidencias[evidenciaId];
                    const laudoId = laudosEvidencias[evidenciaId];

                    return (
                      <EvidenciaItem
                        key={evidenciaId || index}
                        evidencia={evidencia}
                        index={index}
                        temLaudo={temLaudo}
                        laudoId={laudoId}
                        baixandoPDF={baixandoPDF}
                        gerandoLaudo={gerandoLaudo}
                        onVerEvidencia={onVerEvidencia}
                        onCriarLaudo={onCriarLaudo}
                        onBaixarPDF={onBaixarPDF}
                        onExcluirEvidencia={onExcluirEvidencia}
                      />
                    );
                  })
                ) : evidencias.length > 0 ? (
                  <tr>
                    <td colSpan="3" className="no-evidencias">
                      Nenhuma evidência encontrada com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="3" className="no-evidencias">
                      Nenhuma evidência registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn-adicionar" onClick={onAdicionarEvidencia}>
            Adicionar Evidência
          </button>
        </>
      )}
    </div>
  );
}
