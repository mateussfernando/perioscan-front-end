"use client";

import { useState, useEffect } from "react";

export default function useRelatorios(caso, mostrarNotificacao) {
  const [relatorios, setRelatorios] = useState([]);
  const [carregandoRelatorios, setCarregandoRelatorios] = useState(true);
  const [relatorioAtual, setRelatorioAtual] = useState(null);
  const [baixandoPDFRelatorio, setBaixandoPDFRelatorio] = useState(false);
  const [assinandoRelatorio, setAssinandoRelatorio] = useState(false);

  // Estados para o modal de criação de relatório
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [relatorioData, setRelatorioData] = useState({
    title: "",
    content: "",
    methodology: "",
    conclusion: "",
    status: "rascunho",
  });
  const [criandoRelatorio, setCriandoRelatorio] = useState(false);
  const [erroRelatorio, setErroRelatorio] = useState(null);

  // Estados para o modal de edição de relatório
  const [modalEditarRelatorioAberto, setModalEditarRelatorioAberto] =
    useState(false);
  const [relatorioParaEditar, setRelatorioParaEditar] = useState(null);
  const [editandoRelatorio, setEditandoRelatorio] = useState(false);
  const [erroEdicaoRelatorio, setErroEdicaoRelatorio] = useState(null);

  // Estados para o modal de visualização de relatório
  const [modalVisualizarRelatorioAberto, setModalVisualizarRelatorioAberto] =
    useState(false);

  // Estados para o modal de exclusão de relatório
  const [modalExcluirRelatorioAberto, setModalExcluirRelatorioAberto] =
    useState(false);
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState(null);
  const [excluindoRelatorio, setExcluindoRelatorio] = useState(false);

  // Buscar relatórios do caso
  useEffect(() => {
    if (!caso) return;

    const fetchRelatorios = async () => {
      try {
        const token = localStorage.getItem("token");
        const casoId = caso._id || caso.id;

        setCarregandoRelatorios(true);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/reports?case=${casoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Erro ao buscar relatórios:", response.status);
          setRelatorios([]);
          return;
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRelatorios(data.data);
        } else if (Array.isArray(data)) {
          setRelatorios(data);
        } else {
          console.error(
            "Formato de resposta inesperado para relatórios:",
            data
          );
          setRelatorios([]);
        }
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        setRelatorios([]);
      } finally {
        setCarregandoRelatorios(false);
      }
    };

    fetchRelatorios();
  }, [caso]);

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

  // Funções para abrir/fechar modais
  const abrirModalRelatorio = () => {
    setRelatorioData({
      title: `Relatório: ${caso?.title || "Caso"}`,
      content: "",
      methodology:
        "Análise comparativa de registros odontológicos e evidências coletadas.",
      conclusion: "",
      status: "rascunho",
    });
    setErroRelatorio(null);
    setModalRelatorioAberto(true);
  };

  const fecharModalRelatorio = () => {
    setModalRelatorioAberto(false);
  };

  const abrirModalEditarRelatorio = (relatorio) => {
    setRelatorioParaEditar({ ...relatorio });
    setErroEdicaoRelatorio(null);
    setModalEditarRelatorioAberto(true);
  };

  const fecharModalEditarRelatorio = () => {
    setModalEditarRelatorioAberto(false);
    setRelatorioParaEditar(null);
  };

  const abrirVisualizarRelatorio = (relatorio) => {
    setRelatorioAtual(relatorio);
    setModalVisualizarRelatorioAberto(true);
  };

  const fecharVisualizarRelatorio = () => {
    setModalVisualizarRelatorioAberto(false);
    setRelatorioAtual(null);
  };

  const abrirModalExcluirRelatorio = (relatorio) => {
    setRelatorioParaExcluir(relatorio);
    setModalExcluirRelatorioAberto(true);
  };

  const fecharModalExcluirRelatorio = () => {
    setModalExcluirRelatorioAberto(false);
    setRelatorioParaExcluir(null);
  };

  // Função para lidar com mudanças nos campos do formulário de relatório
  const handleRelatorioChange = (e) => {
    const { name, value } = e.target;
    setRelatorioData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para lidar com mudanças nos campos do formulário de edição de relatório
  const handleEditarRelatorioChange = (e) => {
    const { name, value } = e.target;
    setRelatorioParaEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para criar relatório
  const criarRelatorio = async (e) => {
    e.preventDefault();

    if (!relatorioData.title || !relatorioData.content) {
      setErroRelatorio("Título e conteúdo são obrigatórios.");
      return false;
    }

    setCriandoRelatorio(true);
    setErroRelatorio(null);

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      const dadosParaEnviar = {
        ...relatorioData,
        case: casoId,
      };

      console.log("Enviando dados do relatório:", dadosParaEnviar);

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/reports",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        }
      );

      const responseText = await response.text();
      console.log("Resposta bruta da criação do relatório:", responseText);

      if (!response.ok) {
        throw new Error(
          `Falha ao criar relatório: ${response.status} ${response.statusText}`
        );
      }

      let novoRelatorio;
      try {
        novoRelatorio = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da criação do relatório:",
          e
        );
      }

      console.log("Relatório criado com sucesso:", novoRelatorio);

      if (novoRelatorio && (novoRelatorio.data || novoRelatorio)) {
        const relatorioData = novoRelatorio.data || novoRelatorio;
        setRelatorios((prev) => [...prev, relatorioData]);
        mostrarNotificacao("Relatório criado com sucesso!", "success");
      }

      fecharModalRelatorio();
      return true;
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      setErroRelatorio(`Falha ao criar relatório: ${error.message}`);
      return false;
    } finally {
      setCriandoRelatorio(false);
    }
  };

  // Função para editar relatório
  const editarRelatorio = async (e) => {
    e.preventDefault();

    if (!relatorioParaEditar.title || !relatorioParaEditar.content) {
      setErroEdicaoRelatorio("Título e conteúdo são obrigatórios.");
      return false;
    }

    setEditandoRelatorio(true);
    setErroEdicaoRelatorio(null);

    try {
      const token = localStorage.getItem("token");
      const relatorioId = relatorioParaEditar._id || relatorioParaEditar.id;

      // Criar uma cópia do objeto e remover campos que podem causar conflito
      const dadosParaEnviar = { ...relatorioParaEditar };

      // Remover campos que podem causar conflito
      delete dadosParaEnviar.versions;
      delete dadosParaEnviar._id;
      delete dadosParaEnviar.id;
      delete dadosParaEnviar.createdAt;
      delete dadosParaEnviar.updatedAt;
      delete dadosParaEnviar.__v;

      console.log("Enviando dados atualizados do relatório:", dadosParaEnviar);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        }
      );

      const responseText = await response.text();
      console.log("Resposta bruta da atualização do relatório:", responseText);

      if (!response.ok) {
        throw new Error(
          `Falha ao atualizar relatório: ${response.status} ${response.statusText}`
        );
      }

      let relatorioAtualizado;
      try {
        relatorioAtualizado = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da atualização do relatório:",
          e
        );
      }

      console.log("Relatório atualizado com sucesso:", relatorioAtualizado);

      // Atualizar o relatório na lista
      setRelatorios((prev) =>
        prev.map((rel) =>
          rel._id === relatorioId || rel.id === relatorioId
            ? { ...rel, ...dadosParaEnviar }
            : rel
        )
      );

      mostrarNotificacao("Relatório atualizado com sucesso!", "success");
      fecharModalEditarRelatorio();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar relatório:", error);
      setErroEdicaoRelatorio(`Falha ao atualizar relatório: ${error.message}`);
      return false;
    } finally {
      setEditandoRelatorio(false);
    }
  };

  // Função para baixar o PDF do relatório
  const baixarPDFRelatorio = async (relatorioId) => {
    setBaixandoPDFRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao baixar PDF: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `relatorio-${relatorioId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacao("PDF do relatório baixado com sucesso!", "success");
      } else {
        throw new Error(
          "O servidor não retornou um PDF. Verifique os logs para mais detalhes."
        );
      }
    } catch (error) {
      console.error("Erro ao baixar PDF do relatório:", error);
      mostrarNotificacao(error.message, "error");
    } finally {
      setBaixandoPDFRelatorio(false);
    }
  };

  // Função para assinar relatório
  const assinarRelatorio = async (relatorioId) => {
    // Encontrar o relatório na lista
    const relatorio = relatorios.find(
      (r) => r._id === relatorioId || r.id === relatorioId
    );

    // Verificar se o relatório está finalizado
    if (relatorio && relatorio.status !== "finalizado") {
      mostrarNotificacao(
        "Apenas relatórios com status 'Finalizado' podem ser assinados. Edite o relatório primeiro.",
        "error"
      );
      return;
    }

    setAssinandoRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/sign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao assinar relatório: ${response.status} ${response.statusText}`
        );
      }

      // Atualizar o relatório na lista
      setRelatorios((prev) =>
        prev.map((rel) =>
          rel._id === relatorioId || rel.id === relatorioId
            ? { ...rel, signed: true, signedAt: new Date().toISOString() }
            : rel
        )
      );

      mostrarNotificacao("Relatório assinado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao assinar relatório:", error);
      mostrarNotificacao(
        `Falha ao assinar relatório: ${error.message}`,
        "error"
      );
    } finally {
      setAssinandoRelatorio(false);
    }
  };

  // Função para excluir relatório
  const excluirRelatorio = async (relatorioId) => {
    setExcluindoRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao excluir relatório: ${response.status} ${response.statusText}`
        );
      }

      // Remover o relatório da lista
      setRelatorios((prev) =>
        prev.filter((rel) => rel._id !== relatorioId && rel.id !== relatorioId)
      );
      mostrarNotificacao("Relatório excluído com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      mostrarNotificacao(
        `Falha ao excluir relatório: ${error.message}`,
        "error"
      );
    } finally {
      setExcluindoRelatorio(false);
      fecharModalExcluirRelatorio();
    }
  };

  return {
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
  };
}
