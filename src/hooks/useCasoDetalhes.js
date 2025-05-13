"use client";

import { useState, useEffect, useCallback } from "react";

export default function useCasoDetalhes(casoId) {
  const [caso, setCaso] = useState(null);
  const [loadingCaso, setLoadingCaso] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [casoEditado, setCasoEditado] = useState(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [salvandoCaso, setSalvandoCaso] = useState(false);
  const [excluindoCaso, setExcluindoCaso] = useState(false);
  const [erroEdicao, setErroEdicao] = useState(null);
  const [erroExclusao, setErroExclusao] = useState(null);
  const [notificacao, setNotificacao] = useState({
    mensagem: "",
    tipo: "",
    visivel: false,
  });

  // Função para mostrar notificações
  const mostrarNotificacao = (mensagem, tipo, visivel = true) => {
    setNotificacao({
      mensagem,
      tipo,
      visivel,
    });

    if (visivel) {
      setTimeout(() => {
        setNotificacao((prev) => ({ ...prev, visivel: false }));
      }, 5000);
    }
  };

  // Carregar detalhes do caso
  useEffect(() => {
    const fetchCasoDetalhes = async () => {
      if (!casoId) {
        setLoadingCaso(false);
        return;
      }

      try {
        setLoadingCaso(true);
        setError(null);

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        setUserRole(role || "");
        setUserId(userId || "");

        if (!token) {
          throw new Error("Usuário não autenticado");
        }

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
          throw new Error("Não autorizado");
        }

        if (response.status === 404) {
          throw new Error("Caso não encontrado");
        }

        if (!response.ok) {
          throw new Error(`Erro ao carregar caso: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setCaso(data.data);
          // Inicializar o estado de edição com os dados do caso
          setCasoEditado({
            title: data.data.title || "",
            description: data.data.description || "",
            location: data.data.location || "",
            status: data.data.status || "em andamento",
            type: data.data.type || "outro",
            occurrenceDate: data.data.occurrenceDate
              ? new Date(data.data.occurrenceDate).toISOString().split("T")[0]
              : "",
          });
        } else {
          throw new Error("Formato de resposta inválido");
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do caso:", error);
        setError(`Falha ao carregar detalhes do caso: ${error.message}`);
        setCaso(null);
      } finally {
        setLoadingCaso(false);
      }
    };

    fetchCasoDetalhes();
  }, [casoId]);

  // Função para lidar com mudanças nos campos do formulário de edição
  const handleCasoChange = (e) => {
    const { name, value } = e.target;
    setCasoEditado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para salvar as alterações do caso
  const salvarCaso = async (e) => {
    e.preventDefault();
    setSalvandoCaso(true);
    setErroEdicao(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar permissões para editar
      if (
        userRole !== "admin" &&
        userRole !== "perito" &&
        userRole !== "assistente"
      ) {
        throw new Error("Você não tem permissão para editar casos");
      }

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(casoEditado),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao atualizar caso: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Atualizar o caso no estado
        setCaso((prevCaso) => ({
          ...prevCaso,
          ...casoEditado,
        }));

        // Fechar o modal
        setModalEditarAberto(false);

        // Mostrar notificação de sucesso
        mostrarNotificacao("Caso atualizado com sucesso!", "sucesso");
      } else {
        throw new Error(data.message || "Erro ao atualizar caso");
      }
    } catch (error) {
      console.error("Erro ao salvar caso:", error);
      setErroEdicao(`Falha ao salvar alterações: ${error.message}`);
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

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar permissões para excluir
      if (userRole !== "admin" && userRole !== "perito") {
        throw new Error("Você não tem permissão para excluir casos");
      }

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
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
          `Falha ao excluir caso: ${response.status} - ${errorText}`
        );
      }

      // Redirecionar para a lista de casos após exclusão bem-sucedida
      window.location.href = "/casos";
    } catch (error) {
      console.error("Erro ao excluir caso:", error);
      setErroExclusao(`Falha ao excluir caso: ${error.message}`);
    } finally {
      setExcluindoCaso(false);
    }
  };

  // Função para atualizar o status do caso para finalizado
  const atualizarStatusCasoParaFinalizado = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar se o caso já está finalizado
      if (caso?.status === "finalizado") {
        console.log("Caso já está finalizado, não é necessário atualizar");
        return true;
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {
        status: "finalizado",
        closeDate: new Date().toISOString(), // Definir data de fechamento
      };

      console.log(
        "Atualizando status do caso para finalizado:",
        dadosAtualizacao
      );

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizacao),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao atualizar status do caso: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Atualizar o caso no estado
        setCaso((prevCaso) => ({
          ...prevCaso,
          status: "finalizado",
          closeDate: dadosAtualizacao.closeDate,
        }));

        // Mostrar notificação de sucesso
        mostrarNotificacao("Caso finalizado com sucesso!", "sucesso");
        return true;
      } else {
        throw new Error(data.message || "Erro ao atualizar status do caso");
      }
    } catch (error) {
      console.error("Erro ao atualizar status do caso:", error);
      mostrarNotificacao(`Falha ao finalizar caso: ${error.message}`, "erro");
      return false;
    }
  }, [casoId, caso]);

  // Verificar se o usuário pode excluir o caso
  const podeExcluirCaso = () => {
    // Apenas admin e perito podem excluir casos
    return userRole === "admin" || userRole === "perito";
  };

  // Funções para abrir/fechar modais
  const abrirModalEditar = () => {
    // Verificar permissões para editar
    if (
      userRole !== "admin" &&
      userRole !== "perito" &&
      userRole !== "assistente"
    ) {
      mostrarNotificacao("Você não tem permissão para editar casos", "erro");
      return;
    }

    setModalEditarAberto(true);
  };

  const fecharModalEditar = () => {
    setModalEditarAberto(false);
    setErroEdicao(null);
  };

  const abrirModalExcluir = () => {
    // Verificar permissões para excluir
    if (!podeExcluirCaso()) {
      mostrarNotificacao("Você não tem permissão para excluir casos", "erro");
      return;
    }

    setModalExcluirAberto(true);
  };

  const fecharModalExcluir = () => {
    setModalExcluirAberto(false);
    setErroExclusao(null);
  };

  return {
    caso,
    loadingCaso,
    error,
    userRole,
    userId,
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
