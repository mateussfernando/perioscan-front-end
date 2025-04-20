"use client";

// pages/casos

import "../styles/casos.css";
import AsideNavbar from "@/components/AsideNavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Plus, X, Loader, MapPin, FileText } from "lucide-react";
import ControleDeRota from "@/components/ControleDeRota";

export default function MainCasos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoCaso, setNovoCaso] = useState({
    title: "",
    description: "",
    location: "",
    status: "Em Andamento",
  });
  const [criandoCaso, setCriandoCaso] = useState(false);
  const [erroCriacao, setErroCriacao] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    setUserRole(role || "");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchCasos() {
      try {
        console.log("Iniciando busca de casos...");

        const response = await fetch(
          "https://perioscan-back-end-fhhq.onrender.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Resposta recebida:", response);

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          setError("Endpoint não encontrado (404) - Verifique a URL da API");
          setCasos([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const textData = await response.text();
        console.log("Resposta em texto:", textData);

        const responseObject = textData ? JSON.parse(textData) : {};
        console.log("Dados recebidos:", responseObject);

        // Verifica se a resposta tem a propriedade 'data' e é um array
        if (responseObject.success && Array.isArray(responseObject.data)) {
          setCasos(responseObject.data);
        } else {
          console.error("Formato de resposta inesperado:", responseObject);
          setCasos([]);
        }

        setError(null);
      } catch (error) {
        console.error("Erro completo:", error);
        setError(`Falha ao carregar casos: ${error.message}`);
        setCasos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCasos();
  }, [router]);

  // Verifica se o usuário tem permissão para criar casos
  const podeAdicionarCaso = () => {
    return userRole === "admin" || userRole === "perito";
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para visualizar detalhes de um caso
  const verDetalhesCaso = (id) => {
    // Navegar para a página de detalhes do caso
    router.push(`/casos/${id}`);
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    if (!status) return "status-desconhecido";

    // Normalize o status para minúsculas e sem espaços
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");

    switch (normalizedStatus) {
      case "em-andamento":
        return "status-em-andamento";
      case "finalizado":
        return "status-finalizado";
      case "pendente":
        return "status-pendente";
      case "arquivado":
        return "status-arquivado";
      case "cancelado":
        return "status-cancelado";
      default:
        return "status-outro";
    }
  };

  // Função para abrir o modal de novo caso
  const abrirModalNovo = () => {
    if (!podeAdicionarCaso()) {
      alert("Apenas administradores e peritos podem criar novos casos.");
      return;
    }

    // Resetar o formulário
    setNovoCaso({
      title: "",
      description: "",
      location: "",
      status: "em andamento",
    });
    setErroCriacao(null);
    setModalNovoAberto(true);
  };

  // Função para fechar o modal de novo caso
  const fecharModalNovo = () => {
    setModalNovoAberto(false);
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleCasoChange = (e) => {
    const { name, value } = e.target;
    setNovoCaso((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para criar um novo caso
  const criarCaso = async (e) => {
    e.preventDefault();

    if (!novoCaso.title) {
      setErroCriacao("O título do caso é obrigatório.");
      return;
    }

    setCriandoCaso(true);
    setErroCriacao(null);

    try {
      const token = localStorage.getItem("token");

      console.log("Enviando dados do novo caso:", novoCaso);

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/cases",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novoCaso),
        }
      );

      // Capturar a resposta completa para debug
      const responseText = await response.text();
      console.log("Resposta bruta da criação do caso:", responseText);

      if (!response.ok) {
        console.error("Resposta de erro ao criar caso:", responseText);
        throw new Error(
          `Falha ao criar caso: ${response.status} ${response.statusText}`
        );
      }

      // Tentar analisar a resposta como JSON
      let casoCriado;
      try {
        casoCriado = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação do caso:", e);
        // Continuar mesmo com erro de parsing
      }

      console.log("Caso criado com sucesso:", casoCriado);

      // Fechar o modal
      fecharModalNovo();

      // Recarregar a lista de casos
      const casosResponse = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/cases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (casosResponse.ok) {
        const casosData = await casosResponse.json();
        if (casosData.success && Array.isArray(casosData.data)) {
          setCasos(casosData.data);
        }
      }

      // Alternativa: adicionar o novo caso à lista existente
      // if (casoCriado && casoCriado.data) {
      //   setCasos(casos => [...casos, casoCriado.data]);
      // }
    } catch (error) {
      console.error("Erro ao criar caso:", error);
      setErroCriacao(`Falha ao criar caso: ${error.message}`);
    } finally {
      setCriandoCaso(false);
    }
  };

  return (
    <ControleDeRota>
      <div className="main-conteiner-casos">
        <AsideNavbar />

        <div className="container-casos">
          <div className="header-casos">
            <h2>Página de Casos</h2>
            <div className="input-casos">
              <input type="text" placeholder="Buscar caso..." />
              <button className="btn-search">
                <Search />
              </button>
            </div>
          </div>

          <div className="top-bar-casos">
            <button
              className={`btn-novo-caso ${
                !podeAdicionarCaso() ? "btn-disabled" : ""
              }`}
              onClick={abrirModalNovo}
              disabled={!podeAdicionarCaso()}
              title={
                !podeAdicionarCaso()
                  ? "Apenas administradores e peritos podem criar casos"
                  : "Criar novo caso"
              }
            >
              <Plus size={16} />
              Novo caso
            </button>
          </div>

          <div className="tabela-container">
            {/* Versão de tabela para desktop */}
            <div className="desktop-view">
              <table className="tabela-casos">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Local</th>
                    <th>Data abertura</th>
                    <th>Data fechamento</th>
                    <th>Criado por:</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">Carregando casos...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7">Erro ao carregar casos: {error}</td>
                    </tr>
                  ) : casos.length === 0 ? (
                    <tr>
                      <td colSpan="7">Nenhum caso encontrado.</td>
                    </tr>
                  ) : (
                    casos.map((caso) => (
                      <tr key={caso._id}>
                        <td>{caso.title || "--"}</td>
                        <td>{caso.location || "--"}</td>
                        <td>{formatarData(caso.openDate)}</td>
                        <td>{formatarData(caso.closeDate)}</td>
                        <td>{caso.createdBy?.name || "--"}</td>
                        <td>
                          <span
                            className={`status ${getStatusClassName(
                              caso.status
                            )}`}
                          >
                            {caso.status || "--"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-ver-caso"
                            onClick={() => verDetalhesCaso(caso._id)}
                            title="Ver detalhes do caso"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Versão de cards para mobile */}
            <div className="mobile-view">
              {loading ? (
                <div className="loading-card">Carregando casos...</div>
              ) : error ? (
                <div className="error-card">
                  Erro ao carregar casos: {error}
                </div>
              ) : casos.length === 0 ? (
                <div className="empty-card">Nenhum caso encontrado.</div>
              ) : (
                casos.map((caso) => (
                  <div
                    key={caso._id}
                    className="caso-card"
                    onClick={() => verDetalhesCaso(caso._id)}
                  >
                    <div className="caso-card-header">
                      <h3>{caso.title || "Sem título"}</h3>
                      <span
                        className={`status ${getStatusClassName(caso.status)}`}
                      >
                        {caso.status || "--"}
                      </span>
                    </div>
                    <div className="caso-card-body">
                      <div className="caso-card-info">
                        <p>
                          <strong>Local:</strong> {caso.location || "--"}
                        </p>
                        <p>
                          <strong>Abertura:</strong>{" "}
                          {formatarData(caso.openDate)}
                        </p>
                        <p>
                          <strong>Criado por:</strong>{" "}
                          {caso.createdBy?.name || "--"}
                        </p>
                      </div>
                      <button
                        className="btn-ver-caso"
                        onClick={(e) => {
                          e.stopPropagation();
                          verDetalhesCaso(caso._id);
                        }}
                        title="Ver detalhes do caso"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal para criar novo caso */}
        {modalNovoAberto && (
          <div className="modal-overlay" onClick={fecharModalNovo}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Criar Novo Caso</h3>
                <button className="btn-fechar-modal" onClick={fecharModalNovo}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={criarCaso} className="form-novo-caso">
                  {/* Título do caso */}
                  <div className="form-group">
                    <label htmlFor="title">
                      <FileText size={16} />
                      <span>Título do Caso</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={novoCaso.title}
                      onChange={handleCasoChange}
                      placeholder="Ex: Identificação de Vítima em Incêndio"
                      required
                    />
                  </div>

                  {/* Local */}
                  <div className="form-group">
                    <label htmlFor="location">
                      <MapPin size={16} />
                      <span>Local</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={novoCaso.location}
                      onChange={handleCasoChange}
                      placeholder="Ex: Belo Horizonte, MG"
                    />
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={novoCaso.status}
                      onChange={handleCasoChange}
                    >
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Arquivado">Arquivado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                      id="description"
                      name="description"
                      value={novoCaso.description}
                      onChange={handleCasoChange}
                      placeholder="Descreva os detalhes do caso..."
                      rows={6}
                    ></textarea>
                  </div>

                  {/* Mensagem de erro */}
                  {erroCriacao && (
                    <div className="form-error">
                      <p>{erroCriacao}</p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={fecharModalNovo}
                      disabled={criandoCaso}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-salvar"
                      disabled={criandoCaso}
                    >
                      {criandoCaso ? (
                        <>
                          <Loader size={16} className="spinner" />
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Criar Caso</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ControleDeRota>
  );
}
