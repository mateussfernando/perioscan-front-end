"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useCasoDetalhes(casoId) {
  const router = useRouter();
  const [caso, setCaso] = useState(null);
  const [loadingCaso, setLoadingCaso] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");

  // Estados para o modal de edição de caso
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [casoEditado, setCasoEditado] = useState({
    title: "",
    description: "",
    location: "",
    status: "em andamento",
    observation: "",
    occurrenceDate: "",
    type: "outro",
  });
  const [salvandoCaso, setSalvandoCaso] = useState(false);
  const [erroEdicao, setErroEdicao] = useState(null);

  // Estados para o modal de exclusão de caso
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindoCaso, setExcluindoCaso] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({
    visible: false,
    message: "",
    type: "",
  });

  // Buscar detalhes do caso
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    setUserRole(role || "");

    if (!token) {
      router.push("/");
      return;
    }

    if (!casoId) {
      setError("ID do caso não encontrado");
      setLoadingCaso(false);
      return;
    }

    async function fetchCasoDetalhes() {
      try {
        setLoadingCaso(true);
        console.log(`Buscando detalhes do caso ${casoId}...`);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const textData = await response.text();
        const responseObject = textData ? JSON.parse(textData) : {};

        if (responseObject.success && responseObject.data) {
          setCaso(responseObject.data);
          const statusNormalizado = normalizarStatus(
            responseObject.data.status || "em andamento"
          );

          setCasoEditado({
            title: responseObject.data.title || "",
            description: responseObject.data.description || "",
            location: responseObject.data.location || "",
            status: statusNormalizado,
            observation: responseObject.data.observation || "",
            occurrenceDate: responseObject.data.occurrenceDate || "",
            type: responseObject.data.type || "outro",
          });
        } else {
          console.error("Formato de resposta inesperado:", responseObject);
          setError("Formato de resposta inesperado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do caso:", error);
        setError(`Falha ao carregar detalhes do caso: ${error.message}`);
      } finally {
        setLoadingCaso(false);
      }
    }

    fetchCasoDetalhes();
  }, [casoId, router]);

  // Função para normalizar status
  const normalizarStatus = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "em andamento" || statusLower === "em-andamento") {
      return "em andamento";
    } else if (statusLower === "finalizado") {
      return "finalizado";
    } else if (statusLower === "pendente") {
      return "pendente";
    } else if (statusLower === "arquivado") {
      return "arquivado";
    } else if (statusLower === "cancelado") {
      return "cancelado";
    } else {
      return "em andamento"; // Default
    }
  };

  // Função para lidar com mudanças nos campos do formulário de edição
  const handleCasoChange = (e) => {
    const { name, value } = e.target;
    setCasoEditado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para salvar o caso
  const salvarCaso = async (e, casoModificado) => {
    e.preventDefault();
    setSalvandoCaso(true);
    setErroEdicao(null);

    try {
      const token = localStorage.getItem("token");
      const id = caso._id || caso.id;

      const dadosParaEnviar = {
        ...(casoModificado || casoEditado),
        status: normalizarStatus(casoEditado.status),
      };

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}`,
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

      if (!response.ok) {
        throw new Error(
          `Falha ao atualizar caso: ${response.status} ${response.statusText}`
        );
      }

      let casoAtualizado;
      try {
        casoAtualizado = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da atualização do caso:",
          e
        );
      }

      if (casoAtualizado && casoAtualizado.data) {
        setCaso(casoAtualizado.data);
      } else {
        window.location.reload();
      }

      fecharModalEditar();
    } catch (error) {
      console.error("Erro ao atualizar caso:", error);
      setErroEdicao(`Falha ao atualizar caso: ${error.message}`);
    } finally {
      setSalvandoCaso(false);
    }
  };

  // Função para excluir o caso
  const excluirCaso = async () => {
    setExcluindoCaso(true);
    setErroExclusao(null);

    try {
      const token = localStorage.getItem("token");
      const id = caso._id || caso.id;

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao excluir caso: ${response.status} ${response.statusText}`
        );
      }

      router.push("/casos");
    } catch (error) {
      console.error("Erro ao excluir caso:", error);
      setErroExclusao(`Falha ao excluir caso: ${error.message}`);
    } finally {
      setExcluindoCaso(false);
    }
  };

  // Função para atualizar o status do caso para finalizado após criar um relatório
  const atualizarStatusCasoParaFinalizado = async () => {
    try {
      console.log("Atualizando status do caso para finalizado...");

      // Criar uma cópia do caso atual com status atualizado e data de fechamento
      const casoAtualizado = {
        ...casoEditado,
        status: "finalizado",
        closedAt: caso.closedAt || new Date().toISOString(),
      };

      console.log("Dados do caso para atualização:", casoAtualizado);

      // Criar um evento sintético para passar para salvarCaso
      const syntheticEvent = { preventDefault: () => {} };

      // Chamar a função existente para salvar o caso
      await salvarCaso(syntheticEvent, casoAtualizado);

      // Atualizar o estado local do caso
      setCaso((prev) => ({
        ...prev,
        status: "finalizado",
        closedAt: prev.closedAt || new Date().toISOString(),
      }));

      console.log(
        "Status do caso atualizado para finalizado após criar relatório"
      );

      // Mostrar notificação adicional
      mostrarNotificacao(
        "Status do caso atualizado para Finalizado",
        "success"
      );

      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do caso:", error);
      mostrarNotificacao("Erro ao atualizar status do caso", "error");
      return false;
    }
  };

  // Verifica se o usuário tem permissão para excluir casos
  const podeExcluirCaso = () => {
    return (
      userRole === "admin" ||
      (userRole === "perito" &&
        caso?.createdBy?.id === localStorage.getItem("userId"))
    );
  };

  // Funções para abrir/fechar modais
  const abrirModalEditar = () => {
    setErroEdicao(null);
    setModalEditarAberto(true);
  };

  const fecharModalEditar = () => {
    setModalEditarAberto(false);
  };

  const abrirModalExcluir = () => {
    if (!podeExcluirCaso()) {
      alert("Você não tem permissão para excluir este caso.");
      return;
    }
    setErroExclusao(null);
    setModalExcluirAberto(true);
  };

  const fecharModalExcluir = () => {
    setModalExcluirAberto(false);
  };

  // Função para mostrar notificações
  const mostrarNotificacao = (message, type = "info", visible = true) => {
    setNotificacao({ message, type, visible });
    if (visible) {
      setTimeout(() => {
        setNotificacao((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  return {
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
  };
}
