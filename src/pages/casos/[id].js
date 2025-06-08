"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AsideNavbar from "@/components/AsideNavBar";
import "../../styles/caso-detalhes.css";
import { useState } from "react";

// Hooks personalizados
import useCasoDetalhes from "@/hooks/useCasoDetalhes";
import useEvidencias from "@/hooks/useEvidencias";
import useRelatorios from "@/hooks/useRelatorios";
import useVitimas from "@/hooks/useVitimas";
import useVitima from "@/hooks/useVitima";

// Componentes
import CasoDetalhesHeader from "@/components/casos/CasoDetalhesHeader";
import CasoInfoGeral from "@/components/casos/CasoInfoGeral";
import CasoDescricao from "@/components/casos/CasoDescricao";
import VitimasLista from "@/components/casos/VitimasLista";
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
import ModalAdicionarVitima from "@/components/casos/ModalAdicionarVitima";
import ModalEditarVitima from "@/components/casos/ModalEditarVitima";
import ModalExcluirVitima from "@/components/casos/ModalExcluirVitima";

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

  // Hook para vítimas
  const { vitimas, loadingVitimas, errorVitimas } = useVitimas(casoId);

  // Hook para adicionar vítima
  const {
    modalVitimaAberto,
    salvandoVitima,
    erroSalvarVitima,
    abrirModalVitima,
    fecharModalVitima,
    salvarVitima,
  } = useVitima(casoId, mostrarNotificacao);

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
    atualizarRelatorioData,
    criarRelatorio,
    editarRelatorio,
    baixarPDFRelatorio,
    assinarRelatorio,
    excluirRelatorio,
    verificarRelatorioAssinado,
  } = useRelatorios(caso, mostrarNotificacao);

  const [vitimaParaEditar, setVitimaParaEditar] = useState(null);
  const [vitimaParaExcluir, setVitimaParaExcluir] = useState(null);
  const [editandoVitima, setEditandoVitima] = useState(false);
  const [excluindoVitima, setExcluindoVitima] = useState(false);
  const [erroEdicaoVitima, setErroEdicaoVitima] = useState(null);
  const [erroExclusaoVitima, setErroExclusaoVitima] = useState(null);

  // Handlers para editar vítima
  const abrirModalEditarVitima = (vitima) => {
    setVitimaParaEditar(vitima);
    setErroEdicaoVitima(null);
  };
  const fecharModalEditarVitima = () => {
    setVitimaParaEditar(null);
    setErroEdicaoVitima(null);
  };
  const salvarEdicaoVitima = async (dadosVitima) => {
    setEditandoVitima(true);
    setErroEdicaoVitima(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");
      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/victims/${vitimaParaEditar._id || vitimaParaEditar.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosVitima),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao editar vítima: ${response.status} - ${errorText}`);
      }
      fecharModalEditarVitima();
      window.location.reload();
    } catch (error) {
      setErroEdicaoVitima(error.message);
    } finally {
      setEditandoVitima(false);
    }
  };

  // Handlers para excluir vítima
  const abrirModalExcluirVitima = (vitima) => {
    setVitimaParaExcluir(vitima);
    setErroExclusaoVitima(null);
  };
  const fecharModalExcluirVitima = () => {
    setVitimaParaExcluir(null);
    setErroExclusaoVitima(null);
  };
  const excluirVitima = async () => {
    setExcluindoVitima(true);
    setErroExclusaoVitima(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");
      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/victims/${vitimaParaExcluir._id || vitimaParaExcluir.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao excluir vítima: ${response.status} - ${errorText}`);
      }
      fecharModalExcluirVitima();
      window.location.reload();
    } catch (error) {
      setErroExclusaoVitima(error.message);
    } finally {
      setExcluindoVitima(false);
    }
  };

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

                {/* Seção de vítimas */}
                <VitimasLista
                  vitimas={vitimas}
                  loadingVitimas={loadingVitimas}
                  errorVitimas={errorVitimas}
                  onAdicionarVitima={abrirModalVitima}
                  onEditarVitima={abrirModalEditarVitima}
                  onExcluirVitima={abrirModalExcluirVitima}
                />

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
            atualizarRelatorioData={atualizarRelatorioData}
            criando={criandoRelatorio}
            erro={erroRelatorio}
            caso={caso}
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

        {/* Modal de adicionar vítima */}
        {modalVitimaAberto && (
          <ModalAdicionarVitima
            onFechar={fecharModalVitima}
            onSalvar={salvarVitima}
            salvando={salvandoVitima}
            erro={erroSalvarVitima}
          />
        )}

        {/* Modal de editar vítima */}
        {vitimaParaEditar && (
          <ModalEditarVitima
            vitima={vitimaParaEditar}
            onFechar={fecharModalEditarVitima}
            onSalvar={salvarEdicaoVitima}
            salvando={editandoVitima}
            erro={erroEdicaoVitima}
          />
        )}
        {/* Modal de excluir vítima */}
        {vitimaParaExcluir && (
          <ModalExcluirVitima
            vitima={vitimaParaExcluir}
            onFechar={fecharModalExcluirVitima}
            onExcluir={excluirVitima}
            excluindo={excluindoVitima}
            erro={erroExclusaoVitima}
          />
        )}
      </div>
    </div>
  );
}
