"use client";

import { useState, useEffect } from "react";

export default function useEvidencias(casoId, mostrarNotificacao) {
  const [evidencias, setEvidencias] = useState([]);
  const [loadingEvidencias, setLoadingEvidencias] = useState(true);
  const [evidenciasFiltradas, setEvidenciasFiltradas] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    tipo: "",
    dataInicio: "",
    dataFim: "",
    criadoPor: "",
  });

  // Estados para visualização de evidência
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados para laudos
  const [laudosEvidencias, setLaudosEvidencias] = useState({});
  const [gerandoLaudo, setGerandoLaudo] = useState({});
  const [baixandoPDF, setBaixandoPDF] = useState({});

  // Estados para o modal de criar laudo
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false);
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null);
  const [criandoLaudo, setCriandoLaudo] = useState(false);
  const [erroLaudo, setErroLaudo] = useState(null);

  // Estados para o modal de adicionar evidência
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);
  const [erroUpload, setErroUpload] = useState(null);

  // Estados para o modal de exclusão de evidência
  const [modalExcluirEvidenciaAberto, setModalExcluirEvidenciaAberto] =
    useState(false);
  const [evidenciaParaExcluir, setEvidenciaParaExcluir] = useState(null);
  const [excluindoEvidencia, setExcluindoEvidencia] = useState(false);
  const [erroExclusaoEvidencia, setErroExclusaoEvidencia] = useState(null);

  // Buscar evidências do caso
  useEffect(() => {
    if (!casoId) return;

    async function fetchEvidencias() {
      try {
        setLoadingEvidencias(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
            return;
          }
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const textData = await response.text();
        const responseObject = textData ? JSON.parse(textData) : {};

        if (responseObject.success && responseObject.data) {
          setEvidencias(responseObject.data);

          // Buscar laudos existentes para cada evidência
          const evidenciasIds = responseObject.data.map(
            (ev) => ev._id || ev.id
          );
          if (evidenciasIds.length > 0) {
            fetchLaudosExistentes(evidenciasIds);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar evidências do caso:", error);
      } finally {
        setLoadingEvidencias(false);
      }
    }

    // Função para buscar laudos existentes para as evidências
    async function fetchLaudosExistentes(evidenciasIds) {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Erro ao buscar laudos existentes:", response.status);
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          // Mapear evidências para seus laudos
          const laudosMap = {};
          data.data.forEach((laudo) => {
            if (evidenciasIds.includes(laudo.evidence)) {
              laudosMap[laudo.evidence] = laudo._id || laudo.id;
            }
          });

          setLaudosEvidencias(laudosMap);
        }
      } catch (error) {
        console.error("Erro ao buscar laudos existentes:", error);
      }
    }

    fetchEvidencias();
  }, [casoId]);

  // Filtrar evidências quando os dados mudarem
  useEffect(() => {
    filtrarEvidencias();
  }, [evidencias, termoBusca, filtrosAtivos]);

  // Função para filtrar evidências
  const filtrarEvidencias = () => {
    if (!evidencias.length) {
      setEvidenciasFiltradas([]);
      return;
    }

    let resultado = [...evidencias];

    // Filtrar por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(
        (ev) =>
          (ev.description && ev.description.toLowerCase().includes(termo)) ||
          (ev.content && ev.content.toLowerCase().includes(termo))
      );
    }

    // Filtrar por tipo
    if (filtrosAtivos.tipo) {
      resultado = resultado.filter((ev) => ev.type === filtrosAtivos.tipo);
    }

    // Filtrar por data de criação
    if (filtrosAtivos.dataInicio) {
      const dataInicio = new Date(filtrosAtivos.dataInicio);
      resultado = resultado.filter((ev) => {
        const dataEvidencia = new Date(ev.createdAt || ev.collectionDate);
        return dataEvidencia >= dataInicio;
      });
    }

    if (filtrosAtivos.dataFim) {
      const dataFim = new Date(filtrosAtivos.dataFim);
      dataFim.setHours(23, 59, 59, 999); // Fim do dia
      resultado = resultado.filter((ev) => {
        const dataEvidencia = new Date(ev.createdAt || ev.collectionDate);
        return dataEvidencia <= dataFim;
      });
    }

    // Filtrar por criador
    if (filtrosAtivos.criadoPor) {
      const termoCriador = filtrosAtivos.criadoPor.toLowerCase();
      resultado = resultado.filter(
        (ev) =>
          (ev.collectedBy?.name &&
            ev.collectedBy.name.toLowerCase().includes(termoCriador)) ||
          (typeof ev.collectedBy === "string" &&
            ev.collectedBy.toLowerCase().includes(termoCriador))
      );
    }

    setEvidenciasFiltradas(resultado);
  };

  // Funções para lidar com busca e filtros
  const handleSearch = (termo) => {
    setTermoBusca(termo);
  };

  const handleFilter = (filtros) => {
    setFiltrosAtivos(filtros);
  };

  // Funções para abrir/fechar modais
  const abrirEvidenciaModal = (evidencia) => {
    setEvidenciaAtiva(evidencia);
    setModalAberto(true);
  };

  const fecharEvidenciaModal = () => {
    setModalAberto(false);
    setEvidenciaAtiva(null);
  };

  const abrirModalCriarLaudo = (evidencia) => {
    setEvidenciaParaLaudo(evidencia);
    setErroLaudo(null);
    setModalCriarLaudoAberto(true);
  };

  const fecharModalCriarLaudo = () => {
    setModalCriarLaudoAberto(false);
    setEvidenciaParaLaudo(null);
  };

  const abrirModalAdicionar = () => {
    setModalAdicionarAberto(true);
  };

  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false);
  };

  const abrirModalExcluirEvidencia = (evidencia) => {
    setEvidenciaParaExcluir(evidencia);
    setErroExclusaoEvidencia(null);
    setModalExcluirEvidenciaAberto(true);
  };

  const fecharModalExcluirEvidencia = () => {
    setModalExcluirEvidenciaAberto(false);
    setEvidenciaParaExcluir(null);
  };

  // Função para criar o laudo da evidência
  const criarLaudo = async (evidencia, dadosLaudo) => {
    if (!evidencia) {
      setErroLaudo("Evidência não selecionada");
      return;
    }

    setCriandoLaudo(true);
    setErroLaudo(null);

    try {
      const token = localStorage.getItem("token");
      const evidenciaId = evidencia._id || evidencia.id;

      // Preparar dados para enviar ao backend
      const laudoData = {
        title: dadosLaudo.titulo,
        content: dadosLaudo.conteudo,
        evidence: evidenciaId,
        findings: dadosLaudo.achados,
        methodology: dadosLaudo.metodologia,
      };

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(laudoData),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Falha ao criar laudo: ${response.status} ${response.statusText}`
        );
      }

      // Tentar analisar a resposta como JSON
      let novoLaudo;
      try {
        novoLaudo = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação de laudo:", e);
      }

      // Atualizar o mapeamento de laudos
      if (novoLaudo && (novoLaudo.data || novoLaudo)) {
        const laudoData = novoLaudo.data || novoLaudo;
        const laudoId = laudoData._id || laudoData.id;

        setLaudosEvidencias((prev) => ({
          ...prev,
          [evidenciaId]: laudoId,
        }));

        mostrarNotificacao(
          "Laudo criado com sucesso! Agora você pode baixar o PDF.",
          "success"
        );
      }

      // Fechar o modal
      fecharModalCriarLaudo();
    } catch (error) {
      console.error("Erro ao criar laudo:", error);
      setErroLaudo(`Falha ao criar laudo: ${error.message}`);
    } finally {
      setCriandoLaudo(false);
    }
  };

  // Função para excluir a evidência
  const excluirEvidencia = async () => {
    if (!evidenciaParaExcluir) return;

    setExcluindoEvidencia(true);
    setErroExclusaoEvidencia(null);

    try {
      const token = localStorage.getItem("token");
      const evidenciaId = evidenciaParaExcluir._id || evidenciaParaExcluir.id;

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence/${evidenciaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao excluir evidência: ${response.status} ${response.statusText}`
        );
      }

      // Remover a evidência da lista
      setEvidencias(
        evidencias.filter(
          (ev) => ev._id !== evidenciaId && ev.id !== evidenciaId
        )
      );

      // Atualizar a lista filtrada também
      setEvidenciasFiltradas(
        evidenciasFiltradas.filter(
          (ev) => ev._id !== evidenciaId && ev.id !== evidenciaId
        )
      );

      mostrarNotificacao("Evidência excluída com sucesso!", "success");

      // Fechar o modal
      fecharModalExcluirEvidencia();
    } catch (error) {
      console.error("Erro ao excluir evidência:", error);
      setErroExclusaoEvidencia(`Falha ao excluir evidência: ${error.message}`);
    } finally {
      setExcluindoEvidencia(false);
    }
  };

  // Função para baixar o PDF do laudo
  const baixarPDF = async (evidenciaId, laudoId) => {
    // Atualizar estado para mostrar o loader para este laudo específico
    setBaixandoPDF((prev) => ({ ...prev, [laudoId]: true }));

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports/${laudoId}/pdf`,
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

      // Verificar o tipo de conteúdo da resposta
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/pdf")) {
        // É um PDF, vamos fazer o download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `laudo-evidencia-${evidenciaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacao("PDF baixado com sucesso!", "success");
      } else {
        throw new Error(
          "O servidor não retornou um PDF. Verifique os logs para mais detalhes."
        );
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      mostrarNotificacao(error.message, "error");
    } finally {
      // Remover o estado de loading para este laudo
      setBaixandoPDF((prev) => {
        const newState = { ...prev };
        delete newState[laudoId];
        return newState;
      });
    }
  };

  // Função para enviar a evidência
  const enviarEvidencia = async (e, dadosEvidencia) => {
    e.preventDefault();

    const {
      tipoEvidencia,
      descricaoEvidencia,
      conteudoTexto,
      imagemSelecionada,
      tipoImagem,
    } = dadosEvidencia;

    if (tipoEvidencia === "image" && !imagemSelecionada) {
      setErroUpload("Por favor, selecione uma imagem para upload.");
      return;
    }

    if (tipoEvidencia === "text" && !conteudoTexto) {
      setErroUpload("Por favor, insira o conteúdo do texto.");
      return;
    }

    if (!descricaoEvidencia) {
      setErroUpload("Por favor, insira uma descrição para a evidência.");
      return;
    }

    setEnviandoEvidencia(true);
    setErroUpload(null);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Para evidências do tipo imagem, primeiro fazemos upload da imagem
      let imageUrl = null;
      let uploadData = null;
      if (tipoEvidencia === "image" && imagemSelecionada) {
        const formData = new FormData();
        formData.append("image", imagemSelecionada);
        formData.append("evidenceType", "caso");
        formData.append("case", casoId);

        const uploadResponse = await fetch(
          "https://perioscan-back-end-fhhq.onrender.com/api/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(
            `Falha ao fazer upload da imagem: ${uploadResponse.status}`
          );
        }

        const responseText = await uploadResponse.text();

        try {
          uploadData = JSON.parse(responseText);
        } catch (e) {
          throw new Error("A resposta da API não é um JSON válido");
        }

        // Tentar encontrar a URL da imagem em diferentes propriedades possíveis
        if (uploadData.data && uploadData.data.url) {
          imageUrl = uploadData.data.url;
        } else if (uploadData.url) {
          imageUrl = uploadData.url;
        } else if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl;
        } else if (uploadData.data && uploadData.data.imageUrl) {
          imageUrl = uploadData.data.imageUrl;
        } else if (uploadData.secure_url) {
          imageUrl = uploadData.secure_url;
        } else if (uploadData.data && uploadData.data.secure_url) {
          imageUrl = uploadData.data.secure_url;
        } else {
          throw new Error(
            "A API de upload não retornou uma URL de imagem válida"
          );
        }

        // Verificar se a URL é válida
        try {
          new URL(imageUrl);
        } catch (e) {
          throw new Error("A URL da imagem retornada é inválida");
        }
      }

      // Verificar se temos uma URL de imagem para evidências do tipo imagem
      if (tipoEvidencia === "image" && !imageUrl) {
        setErroUpload("Falha ao obter URL da imagem. Tente novamente.");
        return;
      }

      // Agora criamos a evidência com todos os campos necessários
      const evidenciaData = {
        type: tipoEvidencia,
        case: casoId,
        description: descricaoEvidencia,
        content: tipoEvidencia === "text" ? conteudoTexto : "",
        evidenceType:
          tipoEvidencia === "image" ? "ImageEvidence" : "TextEvidence",
        annotations: [],
        collectedBy: userId,
      };

      // Adicionar campos específicos para evidências de imagem
      if (tipoEvidencia === "image" && imageUrl) {
        // Extrair o public_id da resposta do Cloudinary
        let publicId = null;
        if (uploadData.data && uploadData.data.public_id) {
          publicId = uploadData.data.public_id;
        } else if (uploadData.public_id) {
          publicId = uploadData.public_id;
        }

        evidenciaData.imageUrl = imageUrl;
        evidenciaData.imageType = tipoImagem;

        // Adicionar o objeto cloudinary que o backend espera
        evidenciaData.cloudinary = {
          url: imageUrl,
          public_id: publicId,
        };
      }

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/evidence",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(evidenciaData),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Falha ao criar evidência: ${response.status} ${response.statusText}`
        );
      }

      let novaEvidencia;
      try {
        novaEvidencia = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da criação de evidência:",
          e
        );
      }

      if (novaEvidencia && novaEvidencia.data) {
        setEvidencias([...evidencias, novaEvidencia.data]);
      }

      // Fechar o modal
      fecharModalAdicionar();

      // Recarregar as evidências para garantir que temos os dados mais recentes
      const evidenciasResponse = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (evidenciasResponse.ok) {
        const evidenciasData = await evidenciasResponse.json();
        if (evidenciasData.success && evidenciasData.data) {
          setEvidencias(evidenciasData.data);
        }
      }

      mostrarNotificacao("Evidência adicionada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao enviar evidência:", error);
      setErroUpload(`Falha ao enviar evidência: ${error.message}`);
    } finally {
      setEnviandoEvidencia(false);
    }
  };

  return {
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
  };
}
