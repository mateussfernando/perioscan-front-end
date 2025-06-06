"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AsideNavbar from "@/components/AsideNavBar";
import "../../styles/caso-detalhes.css";

// Hooks personalizados
import useCasoDetalhes from "@/hooks/useCasoDetalhes";
import useEvidencias from "@/hooks/useEvidencias";
import useRelatorios from "@/hooks/useRelatorios";

// Componentes
import CasoDetalhesHeader from "@/components/casos/CasoDetalhesHeader";
import CasoInfoGeral from "@/components/casos/CasoInfoGeral";
import CasoDescricao from "@/components/casos/CasoDescricao";
import EvidenciasLista from "@/components/casos/EvidenciasLista";
import RelatoriosLista from "@/components/casos/RelatoriosLista";
import NotificacaoLaudo from "@/components/casos/NotificacaoLaudo";
import ModalVisualizarEvidencia from "@/components/casos/ModalVisualizarEvidencia";
import ModalCriarLaudo from "@/components/casos/ModalCriarLaudo";
import ModalAdicionarEvidencia from "@/components/casos/ModalAdicionarEvidencia";
import ModalEditarCaso from "@/components/casos/ModalEditarCaso";
import ModalExcluirCaso from "@/components/casos/ModalExcluirCaso";
import ModalExcluirEvidencia from "@/components/casos/ModalExcluirEvidencia";
import ModalVisualizarRelatorio from "@/components/casos/ModalVisualizarRelatorio";
import ModalExcluirRelatorio from "@/components/casos/ModalExcluirRelatorio";
import ModalCriarRelatorio from "@/components/casos/ModalCriarRelatorio";
import ModalEditarRelatorio from "@/components/casos/ModalEditarRelatorio";

export default function CasoDetalhes() {
  const router = useRouter();
  const params = useParams();
  const casoId = params?.id;

  // Inicializar hooks personalizados
  const {
    caso,
    loadingCaso,
    error,
    userRole,
    casoEditado,
    modalEditarAberto,
    modalExcluirAberto,
    salvandoCaso,
    excluindoCaso,
    erroEdicao,
    erroExclusao,
    notificacao,
    handleCasoChange,
    salvarCaso,
    excluirCaso,
    atualizarStatusCasoParaFinalizado,
    podeExcluirCaso,
    abrirModalEditar,
    fecharModalEditar,
    abrirModalExcluir,
    fecharModalExcluir,
    mostrarNotificacao,
  } = useCasoDetalhes(casoId);

  const {
    evidencias,
    evidenciasFiltradas,
    loadingEvidencias,
    evidenciaAtiva,
    modalAberto,
    modalAdicionarAberto,
    modalCriarLaudoAberto,
    modalExcluirEvidenciaAberto,
    evidenciaParaLaudo,
    evidenciaParaExcluir,
    laudosEvidencias,
    gerandoLaudo,
    baixandoPDF,
    enviandoEvidencia,
    excluindoEvidencia,
    criandoLaudo,
    erroUpload,
    erroLaudo,
    erroExclusaoEvidencia,
    handleSearch,
    handleFilter,
    abrirEvidenciaModal,
    fecharEvidenciaModal,
    abrirModalCriarLaudo,
    fecharModalCriarLaudo,
    abrirModalAdicionar,
    fecharModalAdicionar,
    abrirModalExcluirEvidencia,
    fecharModalExcluirEvidencia,
    criarLaudo,
    baixarPDF,
    excluirEvidencia,
    enviarEvidencia,
  } = useEvidencias(casoId, mostrarNotificacao);

  const {
    relatorios,
    carregandoRelatorios,
    relatorioAtual,
    baixandoPDFRelatorio,
    assinandoRelatorio,
    modalRelatorioAberto,
    relatorioData,
    criandoRelatorio,
    erroRelatorio,
    modalEditarRelatorioAberto,
    relatorioParaEditar,
    editandoRelatorio,
    erroEdicaoRelatorio,
    modalVisualizarRelatorioAberto,
    modalExcluirRelatorioAberto,
    relatorioParaExcluir,
    excluindoRelatorio,
    formatarData,
    abrirModalRelatorio,
    fecharModalRelatorio,
    abrirModalEditarRelatorio,
    fecharModalEditarRelatorio,
    abrirVisualizarRelatorio,
    fecharVisualizarRelatorio,
    abrirModalExcluirRelatorio,
    fecharModalExcluirRelatorio,
    handleRelatorioChange,
    handleEditarRelatorioChange,
    criarRelatorio,
    editarRelatorio,
    baixarPDFRelatorio,
    assinarRelatorio,
    excluirRelatorio,
  } = useRelatorios(caso, mostrarNotificacao);

  // Atualizar status do caso após criar relatório
  const handleCriarRelatorio = async (e) => {
    console.log("Iniciando criação de relatório...");
    const sucesso = await criarRelatorio(e);
    console.log("Resultado da criação de relatório:", sucesso);
  };

  return (
    <div className="main-container-caso-detalhes">
      <AsideNavbar />

      <div className="container-caso-detalhes">
        {/* Notificação */}
        <NotificacaoLaudo
          notificacao={notificacao}
          onFechar={() => mostrarNotificacao("", "", false)}
        />

        {loadingCaso ? (
          <div className="loading-container">
            <p>Carregando detalhes do caso...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button
              onClick={() => router.push("/casos")}
              className="voltar-button"
            >
              Voltar para lista de casos
            </button>
          </div>
        ) : caso ? (
          <div className="caso-card">
            <CasoDetalhesHeader
              caso={caso}
              onEditar={abrirModalEditar}
              onExcluir={abrirModalExcluir}
              onVoltar={() => router.push("/casos")}
              podeExcluir={podeExcluirCaso()}
            />

            <div className="caso-content">
              <div className="info-coluna">
                <CasoInfoGeral caso={caso} />

                <EvidenciasLista
                  evidencias={evidencias}
                  evidenciasFiltradas={evidenciasFiltradas}
                  loadingEvidencias={loadingEvidencias}
                  laudosEvidencias={laudosEvidencias}
                  baixandoPDF={baixandoPDF}
                  gerandoLaudo={gerandoLaudo}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  onVerEvidencia={abrirEvidenciaModal}
                  onCriarLaudo={abrirModalCriarLaudo}
                  onBaixarPDF={baixarPDF}
                  onExcluirEvidencia={abrirModalExcluirEvidencia}
                  onAdicionarEvidencia={abrirModalAdicionar}
                />

                <RelatoriosLista
                  relatorios={relatorios}
                  carregandoRelatorios={carregandoRelatorios}
                  baixandoPDFRelatorio={baixandoPDFRelatorio}
                  assinandoRelatorio={assinandoRelatorio}
                  onVerRelatorio={abrirVisualizarRelatorio}
                  onBaixarPDF={baixarPDFRelatorio}
                  onAssinar={assinarRelatorio}
                  onExcluir={abrirModalExcluirRelatorio}
                  onCriarRelatorio={abrirModalRelatorio}
                  onEditarRelatorio={abrirModalEditarRelatorio}
                  formatarData={formatarData}
                />
              </div>

              <CasoDescricao descricao={caso.description} />
            </div>
          </div>
        ) : (
          <div className="not-found-container">
            <p>Caso não encontrado</p>
            <button
              onClick={() => router.push("/casos")}
              className="voltar-button"
            >
              Voltar para lista de casos
            </button>
          </div>
        )}

        {/* Modais */}
        {modalAberto && evidenciaAtiva && (
          <ModalVisualizarEvidencia
            evidenciaAtiva={evidenciaAtiva}
            temLaudo={
              !!laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]
            }
            laudoId={laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]}
            baixandoPDF={baixandoPDF}
            gerandoLaudo={gerandoLaudo}
            onFechar={fecharEvidenciaModal}
            onCriarLaudo={abrirModalCriarLaudo}
            onBaixarPDF={baixarPDF}
          />
        )}

        {modalCriarLaudoAberto && evidenciaParaLaudo && (
          <ModalCriarLaudo
            evidencia={evidenciaParaLaudo}
            onFechar={fecharModalCriarLaudo}
            onCriar={criarLaudo}
            criandoLaudo={criandoLaudo}
            erroLaudo={erroLaudo}
          />
        )}

        {modalAdicionarAberto && (
          <ModalAdicionarEvidencia
            onFechar={fecharModalAdicionar}
            onEnviar={enviarEvidencia}
            enviandoEvidencia={enviandoEvidencia}
            erroUpload={erroUpload}
          />
        )}

        {modalEditarAberto && (
          <ModalEditarCaso
            casoEditado={casoEditado}
            onFechar={fecharModalEditar}
            onSalvar={salvarCaso}
            onCasoChange={handleCasoChange}
            salvandoCaso={salvandoCaso}
            erroEdicao={erroEdicao}
          />
        )}

        {modalExcluirAberto && (
          <ModalExcluirCaso
            onFechar={fecharModalExcluir}
            onExcluir={excluirCaso}
            excluindoCaso={excluindoCaso}
            erroExclusao={erroExclusao}
          />
        )}

        {modalExcluirEvidenciaAberto && evidenciaParaExcluir && (
          <ModalExcluirEvidencia
            evidencia={evidenciaParaExcluir}
            onFechar={fecharModalExcluirEvidencia}
            onExcluir={excluirEvidencia}
            excluindo={excluindoEvidencia}
            erro={erroExclusaoEvidencia}
          />
        )}

        {modalRelatorioAberto && (
          <ModalCriarRelatorio
            relatorioData={relatorioData}
            onFechar={fecharModalRelatorio}
            onCriar={handleCriarRelatorio}
            onChange={handleRelatorioChange}
            criando={criandoRelatorio}
            erro={erroRelatorio}
          />
        )}

        {modalEditarRelatorioAberto && relatorioParaEditar && (
          <ModalEditarRelatorio
            relatorio={relatorioParaEditar}
            onFechar={fecharModalEditarRelatorio}
            onSalvar={editarRelatorio}
            onChange={handleEditarRelatorioChange}
            editando={editandoRelatorio}
            erro={erroEdicaoRelatorio}
          />
        )}

        {modalVisualizarRelatorioAberto && relatorioAtual && (
          <ModalVisualizarRelatorio
            relatorio={relatorioAtual}
            formatarData={formatarData}
            onFechar={fecharVisualizarRelatorio}
            onBaixarPDF={baixarPDFRelatorio}
            onAssinar={assinarRelatorio}
            baixandoPDF={baixandoPDFRelatorio}
            assinando={assinandoRelatorio}
          />
        )}

        {modalExcluirRelatorioAberto && relatorioParaExcluir && (
          <ModalExcluirRelatorio
            relatorio={relatorioParaExcluir}
            onFechar={fecharModalExcluirRelatorio}
            onExcluir={excluirRelatorio}
            excluindo={excluindoRelatorio}
          />
        )}
      </div>
    </div>
  );
}
