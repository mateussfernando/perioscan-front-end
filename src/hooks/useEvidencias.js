"use client";

import { useState, useEffect, useCallback } from "react";

export default function useEvidencias(casoId, mostrarNotificacao) {
  const [evidencias, setEvidencias] = useState([]);
  const [evidenciasFiltradas, setEvidenciasFiltradas] = useState([]);
  const [loadingEvidencias, setLoadingEvidencias] = useState(true);
  const [loadingLaudos, setLoadingLaudos] = useState(true);
  const [tentativaCarregamento, setTentativaCarregamento] = useState(false);
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false);
  const [modalExcluirEvidenciaAberto, setModalExcluirEvidenciaAberto] =
    useState(false);
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null);
  const [evidenciaParaExcluir, setEvidenciaParaExcluir] = useState(null);
  const [laudosEvidencias, setLaudosEvidencias] = useState({});
  const [gerandoLaudo, setGerandoLaudo] = useState({});
  const [baixandoPDF, setBaixandoPDF] = useState({});
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);
  const [excluindoEvidencia, setExcluindoEvidencia] = useState(false);
  const [criandoLaudo, setCriandoLaudo] = useState(false);
  const [erroUpload, setErroUpload] = useState(null);
  const [erroLaudo, setErroLaudo] = useState(null);
  const [erroExclusaoEvidencia, setErroExclusaoEvidencia] = useState(null);

  // Buscar evidências do caso específico
  const fetchEvidencias = useCallback(async () => {
    if (!casoId) {
      setLoadingEvidencias(false);
      return;
    }

    try {
      setLoadingEvidencias(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Usar a rota específica do caso
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
        if (response.status === 404) {
          // Caso não tenha evidências, retornar array vazio
          console.log("Nenhuma evidência encontrada para este caso");
          setEvidencias([]);
          setEvidenciasFiltradas([]);
          // Removido o return aqui para garantir que o finally sempre execute
        } else {
          throw new Error(`Erro ao buscar evidências: ${response.status}`);
        }
      } else {
        const textData = await response.text();

        // Verificar se a resposta está vazia
        if (!textData) {
          console.log("Resposta vazia ao buscar evidências");
          setEvidencias([]);
          setEvidenciasFiltradas([]);
        } else {
          try {
            const data = JSON.parse(textData);

            if (data.success && Array.isArray(data.data)) {
              console.log("Evidências recebidas do backend:", data.data); // <-- pode remover
              setEvidencias(data.data);
              setEvidenciasFiltradas(data.data);
            } else {
              console.warn(
                "Formato de resposta inesperado para evidências:",
                data
              );
              setEvidencias([]);
              setEvidenciasFiltradas([]);
            }
          } catch (parseError) {
            console.error(
              "Erro ao analisar resposta JSON:",
              parseError,
              "Texto recebido:",
              textData
            );
            setEvidencias([]);
            setEvidenciasFiltradas([]);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar evidências:", error);
      setEvidencias([]);
      setEvidenciasFiltradas([]);
    } finally {
      setLoadingEvidencias(false);
      setTentativaCarregamento(true);
    }
  }, [casoId]);

  // Buscar relatórios de evidência do caso específico
  const fetchRelatoriosEvidencia = useCallback(async () => {
    if (!casoId) {
      setLoadingLaudos(false);
      return;
    }

    try {
      setLoadingLaudos(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Sempre buscar laudos pela rota do caso específico
      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const laudosMap = {};
          data.data.forEach((relatorio) => {
            if (relatorio.evidence) {
              laudosMap[relatorio.evidence] = relatorio._id || relatorio.id;
            }
          });
          setLaudosEvidencias(laudosMap);
        } else {
          setLaudosEvidencias({});
        }
      } else {
        setLaudosEvidencias({});
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios de evidência:", error);
      setLaudosEvidencias({});
    } finally {
      setLoadingLaudos(false);
    }
  }, [casoId]);

  // Método alternativo para buscar relatórios por evidência
  const buscarRelatoriosPorEvidencia = async (evidenciasDoCaso = []) => {
    try {
      const token = localStorage.getItem("token");

      // Buscar todos os relatórios e filtrar manualmente
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
        throw new Error(`Erro ao buscar relatórios: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Filtrar apenas relatórios relacionados às evidências do caso atual
        const evidenciaIds = evidenciasDoCaso.map((ev) => ev._id || ev.id);

        // Mapear relatórios por evidência, filtrando também pelo campo 'case'
        const laudosMap = {};
        data.data.forEach((relatorio) => {
          if (
            relatorio.evidence &&
            evidenciaIds.includes(relatorio.evidence) &&
            (relatorio.case === casoId || relatorio.case?._id === casoId)
          ) {
            laudosMap[relatorio.evidence] = relatorio._id || relatorio.id;
          }
        });
        setLaudosEvidencias(laudosMap);
      }
    } catch (error) {
      console.error("Erro na abordagem alternativa:", error);
      setLaudosEvidencias({});
    }
  };

  // Carregar dados quando o casoId mudar
  useEffect(() => {
    if (casoId) {
      // Resetar estado de tentativa para permitir nova carga
      setTentativaCarregamento(false);
      fetchEvidencias();
    }
  }, [casoId, fetchEvidencias]);

  // Carregar relatórios apenas após carregar evidências
  useEffect(() => {
    if (casoId && tentativaCarregamento && !loadingEvidencias) {
      fetchRelatoriosEvidencia();
    }
  }, [
    casoId,
    tentativaCarregamento,
    loadingEvidencias,
    fetchRelatoriosEvidencia,
  ]);

  // Função de busca
  const handleSearch = (termo) => {
    if (!termo.trim()) {
      setEvidenciasFiltradas(evidencias);
      return;
    }

    const filtradas = evidencias.filter(
      (evidencia) =>
        (evidencia.name?.toLowerCase() || "").includes(termo.toLowerCase()) ||
        (evidencia.description?.toLowerCase() || "").includes(
          termo.toLowerCase()
        )
    );
    setEvidenciasFiltradas(filtradas);
  };

  // Função de filtro por tipo
  const handleFilter = (tipo) => {
    if (tipo === "todos") {
      setEvidenciasFiltradas(evidencias);
      return;
    }

    const filtradas = evidencias.filter((evidencia) => evidencia.type === tipo);
    setEvidenciasFiltradas(filtradas);
  };

  // Função para abrir modal de visualização
  const abrirEvidenciaModal = (evidencia) => {
    setEvidenciaAtiva(evidencia);
    setModalAberto(true);
  };

  // Função para fechar modal de visualização
  const fecharEvidenciaModal = () => {
    setModalAberto(false);
    setEvidenciaAtiva(null);
  };

  // Função para abrir modal de criar laudo
  const abrirModalCriarLaudo = (evidencia) => {
    setEvidenciaParaLaudo(evidencia);
    setModalCriarLaudoAberto(true);
    setErroLaudo(null);
  };

  // Função para fechar modal de criar laudo
  const fecharModalCriarLaudo = () => {
    setModalCriarLaudoAberto(false);
    setEvidenciaParaLaudo(null);
    setErroLaudo(null);
  };

  // Função para abrir modal de adicionar evidência
  const abrirModalAdicionar = () => {
    setModalAdicionarAberto(true);
    setErroUpload(null);
  };

  // Função para fechar modal de adicionar evidência
  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false);
    setErroUpload(null);
  };

  // Função para abrir modal de excluir evidência
  const abrirModalExcluirEvidencia = (evidencia) => {
    setEvidenciaParaExcluir(evidencia);
    setModalExcluirEvidenciaAberto(true);
    setErroExclusaoEvidencia(null);
  };

  // Função para fechar modal de excluir evidência
  const fecharModalExcluirEvidencia = () => {
    setModalExcluirEvidenciaAberto(false);
    setEvidenciaParaExcluir(null);
    setErroExclusaoEvidencia(null);
  };

  // Função para criar laudo
  const criarLaudo = async (dadosLaudo) => {
    setCriandoLaudo(true);
    setErroLaudo(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...dadosLaudo,
            evidence: evidenciaParaLaudo._id || evidenciaParaLaudo.id,
            case: casoId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao criar laudo: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Atualizar o mapeamento de laudos
        setLaudosEvidencias((prev) => ({
          ...prev,
          [evidenciaParaLaudo._id || evidenciaParaLaudo.id]:
            data.data._id || data.data.id,
        }));

        // Fechar modal
        fecharModalCriarLaudo();

        // Mostrar notificação de sucesso
        mostrarNotificacao("Laudo criado com sucesso!", "sucesso");
      } else {
        throw new Error(data.message || "Erro ao criar laudo");
      }
    } catch (error) {
      console.error("Erro ao criar laudo:", error);
      setErroLaudo(`Falha ao criar laudo: ${error.message}`);
    } finally {
      setCriandoLaudo(false);
    }
  };

  // Função para baixar PDF do laudo
  const baixarPDF = async (evidenciaId, laudoId) => {
    // Atualizar estado para mostrar o loader para este laudo específico
    setBaixandoPDF((prev) => ({ ...prev, [laudoId]: true }));

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      if (!laudoId) {
        throw new Error("Laudo não encontrado para esta evidência");
      }

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports/${laudoId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: ${response.status}`);
      }

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

      mostrarNotificacao("PDF baixado com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      mostrarNotificacao(`Erro ao baixar PDF: ${error.message}`, "erro");
    } finally {
      // Remover o estado de loading para este laudo
      setBaixandoPDF((prev) => {
        const newState = { ...prev };
        delete newState[laudoId];
        return newState;
      });
    }
  };

  // Função para excluir evidência
  const excluirEvidencia = async () => {
    if (!evidenciaParaExcluir) return;

    setExcluindoEvidencia(true);
    setErroExclusaoEvidencia(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence/${
          evidenciaParaExcluir._id || evidenciaParaExcluir.id
        }`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao excluir evidência: ${response.status} - ${errorText}`
        );
      }

      // Remover evidência da lista
      const evidenciaId = evidenciaParaExcluir._id || evidenciaParaExcluir.id;
      setEvidencias((prev) =>
        prev.filter((ev) => (ev._id || ev.id) !== evidenciaId)
      );
      setEvidenciasFiltradas((prev) =>
        prev.filter((ev) => (ev._id || ev.id) !== evidenciaId)
      );

      // Remover laudo associado se existir
      setLaudosEvidencias((prev) => {
        const newLaudos = { ...prev };
        delete newLaudos[evidenciaId];
        return newLaudos;
      });

      // Fechar modal
      fecharModalExcluirEvidencia();

      // Mostrar notificação de sucesso
      mostrarNotificacao("Evidência excluída com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao excluir evidência:", error);
      setErroExclusaoEvidencia(`Falha ao excluir evidência: ${error.message}`);
    } finally {
      setExcluindoEvidencia(false);
    }
  };

  // Função para enviar evidência
  const enviarEvidencia = async (e, dadosEvidencia) => {
    e.preventDefault();
    setEnviandoEvidencia(true);
    setErroUpload(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const {
        tipoEvidencia,
        descricaoEvidencia,
        conteudoTexto,
        imagemSelecionada,
        tipoImagem,
      } = dadosEvidencia;

      // Validações
      if (tipoEvidencia === "image" && !imagemSelecionada) {
        throw new Error("Por favor, selecione uma imagem para upload");
      }

      if (tipoEvidencia === "text" && !conteudoTexto) {
        throw new Error("Por favor, insira o conteúdo do texto");
      }

      if (!descricaoEvidencia) {
        throw new Error("Por favor, insira uma descrição para a evidência");
      }

      // Para evidências do tipo imagem, primeiro fazemos upload da imagem
      let imageUrl = null;
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

        const uploadData = await uploadResponse.json();

        // Tentar encontrar a URL da imagem
        if (uploadData.data && uploadData.data.url) {
          imageUrl = uploadData.data.url;
        } else if (uploadData.url) {
          imageUrl = uploadData.url;
        } else if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl;
        } else if (uploadData.data && uploadData.data.imageUrl) {
          imageUrl = uploadData.data.imageUrl;
        } else {
          throw new Error(
            "A API de upload não retornou uma URL de imagem válida"
          );
        }
      }

      // Agora criamos a evidência
      const evidenciaData = {
        type: tipoEvidencia,
        case: casoId,
        description: descricaoEvidencia,
        content: tipoEvidencia === "text" ? conteudoTexto : "",
      };

      // Adicionar campos específicos para evidências de imagem
      if (tipoEvidencia === "image" && imageUrl) {
        evidenciaData.imageUrl = imageUrl;
        evidenciaData.imageType = tipoImagem;
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao criar evidência: ${response.status} - ${errorText}`
        );
      }

      // Recarregar evidências
      await fetchEvidencias();

      // Fechar modal
      fecharModalAdicionar();

      // Mostrar notificação de sucesso
      mostrarNotificacao("Evidência adicionada com sucesso!", "sucesso");
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
    loadingEvidencias: loadingEvidencias || loadingLaudos,
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
