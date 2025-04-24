"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AsideNavBar from "@/components/AsideNavBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ControleDeRota from "@/components/ControleDeRota";
import ModalExcluirRelatorio from "@/components/casos/ModalExcluirRelatorio";
import "../styles/relatorios.css";
import {
  FileText,
  Download,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function Relatorios() {
  // Inicializar relatorios como um array vazio
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [atualizando, setAtualizando] = useState(false);
  const [excluindo, setExcluindo] = useState({});
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const itensPorPagina = 10;
  const router = useRouter();

  // Buscar todos os relatórios
  const buscarRelatorios = async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const resposta = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/reports",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resposta.ok) {
        throw new Error(`Erro ao buscar relatórios: ${resposta.status}`);
      }

      const dados = await resposta.json();

      // Verificar o formato dos dados e extrair os relatórios corretamente
      if (Array.isArray(dados)) {
        setRelatorios(dados);
      } else if (dados && Array.isArray(dados.data)) {
        // Se os relatórios estiverem na propriedade 'data' (formato atual)
        setRelatorios(dados.data);
      } else if (dados && Array.isArray(dados.reports)) {
        // Se os relatórios estiverem na propriedade 'reports'
        setRelatorios(dados.reports);
      } else {
        // Se não encontrarmos os relatórios em nenhum formato esperado
        console.error("Formato de dados inesperado:", dados);
        setRelatorios([]);
        setErro("Os dados retornados pela API não estão no formato esperado.");
      }
    } catch (erro) {
      console.error("Erro ao buscar relatórios:", erro);
      setErro("Falha ao carregar os relatórios. Por favor, tente novamente.");
      // Garantir que relatorios seja um array vazio em caso de erro
      setRelatorios([]);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  // Carregar relatórios ao montar o componente
  useEffect(() => {
    buscarRelatorios();
  }, []);

  // Efeito para esconder a mensagem de sucesso após 5 segundos
  useEffect(() => {
    if (mensagemSucesso) {
      const timer = setTimeout(() => {
        setMensagemSucesso("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagemSucesso]);

  // Função para atualizar a lista de relatórios
  const atualizarRelatorios = () => {
    setAtualizando(true);
    buscarRelatorios();
  };

  // Função para exportar relatório como PDF
  const exportarPDF = async (relatorioId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      // Notificar o usuário que o download está começando
      alert("Iniciando download do relatório em PDF...");

      // Fazer a requisição para a API de exportação de PDF
      const resposta = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resposta.ok) {
        throw new Error(`Erro ao exportar relatório: ${resposta.status}`);
      }

      // Obter o blob do PDF
      const blob = await resposta.blob();

      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob);

      // Criar um elemento <a> para download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `relatorio-${relatorioId}.pdf`;

      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (erro) {
      console.error("Erro ao exportar relatório como PDF:", erro);
      alert("Falha ao exportar o relatório. Por favor, tente novamente.");
    }
  };

  // Função para abrir o modal de exclusão
  const abrirModalExcluir = (relatorio) => {
    setRelatorioParaExcluir(relatorio);
    setModalExcluirAberto(true);
  };

  // Função para fechar o modal de exclusão
  const fecharModalExcluir = () => {
    setModalExcluirAberto(false);
    setRelatorioParaExcluir(null);
  };

  // Função para excluir relatório
  const excluirRelatorio = async (relatorioId) => {
    try {
      setExcluindo((prev) => ({ ...prev, [relatorioId]: true }));

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      console.log(`Tentando excluir relatório com ID: ${relatorioId}`);

      // Garantir que o ID do relatório seja uma string válida
      if (!relatorioId) {
        throw new Error("ID do relatório inválido ou não fornecido");
      }

      // Forçar a exclusão do relatório, mesmo que esteja assinado
      const resposta = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/force-delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Se a rota force-delete não existir, tentar a rota padrão
      if (resposta.status === 404) {
        const respostaPadrao = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!respostaPadrao.ok) {
          // Tentar obter mais detalhes do erro
          let mensagemErro = `Erro ao excluir relatório: ${respostaPadrao.status}`;
          try {
            const erroJson = await respostaPadrao.json();
            if (erroJson && erroJson.message) {
              mensagemErro += ` - ${erroJson.message}`;
            }
          } catch (e) {
            // Se não conseguir obter o JSON, apenas continua com a mensagem básica
          }
          throw new Error(mensagemErro);
        }
      } else if (!resposta.ok) {
        // Tentar obter mais detalhes do erro
        let mensagemErro = `Erro ao excluir relatório: ${resposta.status}`;
        try {
          const erroJson = await resposta.json();
          if (erroJson && erroJson.message) {
            mensagemErro += ` - ${erroJson.message}`;
          }
        } catch (e) {
          // Se não conseguir obter o JSON, apenas continua com a mensagem básica
        }
        throw new Error(mensagemErro);
      }

      // Atualizar a lista de relatórios após exclusão
      setRelatorios(
        relatorios.filter((relatorio) => relatorio._id !== relatorioId)
      );

      // Mostrar mensagem de sucesso
      setMensagemSucesso("Relatório excluído com sucesso!");

      // Recarregar a lista de relatórios para garantir que está atualizada
      buscarRelatorios();

      return true;
    } catch (erro) {
      console.error("Erro ao excluir relatório:", erro);
      alert(
        `Falha ao excluir o relatório: ${erro.message}. Por favor, tente novamente ou contate o suporte.`
      );
      return false;
    } finally {
      setExcluindo((prev) => ({ ...prev, [relatorioId]: false }));
    }
  };

  // Função para navegar para a página de detalhes do caso
  const navegarParaCaso = (casoId) => {
    // Verificar se casoId é um objeto ou uma string
    if (typeof casoId === "object" && casoId !== null) {
      // Se for um objeto, extrair o ID usando _id ou id
      const id = casoId._id || casoId.id;
      if (id) {
        router.push(`/casos/${id}`);
      } else {
        console.error("ID do caso não encontrado no objeto:", casoId);
        alert("Não foi possível encontrar o ID do caso para navegação.");
      }
    } else {
      // Se já for uma string ou outro valor primitivo, usar diretamente
      router.push(`/casos/${casoId}`);
    }
  };

  // Garantir que relatorios seja um array antes de filtrar
  const relatoriosFiltrados = Array.isArray(relatorios)
    ? relatorios.filter((relatorio) => {
        // Verificar se o relatório tem as propriedades necessárias
        if (!relatorio || typeof relatorio !== "object") return false;

        const titulo = relatorio.title || "";
        const conteudo = relatorio.content || "";
        const status = relatorio.status || "";

        // Filtro por texto (título ou conteúdo)
        const correspondeTexto =
          titulo.toLowerCase().includes(filtro.toLowerCase()) ||
          conteudo.toLowerCase().includes(filtro.toLowerCase());

        // Filtro por status
        const correspondeStatus =
          statusFiltro === "todos" ||
          (statusFiltro === "rascunho" && status === "rascunho") ||
          (statusFiltro === "finalizado" && status === "finalizado");

        return correspondeTexto && correspondeStatus;
      })
    : [];

  // Ordenar relatórios (garantindo que é um array)
  const relatoriosOrdenados = [...relatoriosFiltrados].sort((a, b) => {
    if (ordenacao === "recentes") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (ordenacao === "antigos") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (ordenacao === "alfabetica") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  // Paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const relatoriosPaginados = relatoriosOrdenados.slice(
    indicePrimeiroItem,
    indiceUltimoItem
  );
  const totalPaginas = Math.ceil(relatoriosOrdenados.length / itensPorPagina);

  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return "Data não disponível";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "Data inválida";
    }
  };

  // Formatar status para exibição
  const formatarStatus = (status) => {
    if (status === "rascunho") return "Rascunho";
    if (status === "finalizado") return "Finalizado";
    return status || "Não definido";
  };

  return (
    <ControleDeRota>
      <div className="relatorios-page">
        <AsideNavBar />
        <main className="relatorios-content">
          {/* Mensagem de sucesso */}
          {mensagemSucesso && (
            <div className="mensagem-sucesso">
              <AlertCircle size={20} />
              {mensagemSucesso}
            </div>
          )}

          <div className="relatorios-header">
            <div className="header-title-container">
              <h1>Relatórios</h1>
              <button
                className="btn-atualizar"
                onClick={atualizarRelatorios}
                disabled={carregando || atualizando}
                title="Atualizar relatórios"
              >
                <RefreshCw size={20} className={atualizando ? "girando" : ""} />
              </button>
            </div>
            <div className="relatorios-filtros">
              <div className="filtro-busca">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar relatórios..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>

              <div className="filtro-status">
                <Filter size={18} />
                <select
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                >
                  <option value="todos">Todos os status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="filtro-ordenacao">
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="alfabetica">Ordem alfabética</option>
                </select>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="relatorios-loading">
              <p>Carregando relatórios...</p>
            </div>
          ) : erro ? (
            <div className="relatorios-error">
              <FileText size={24} />
              <p>{erro}</p>
            </div>
          ) : relatoriosFiltrados.length === 0 ? (
            <div className="relatorios-empty">
              <FileText size={48} />
              <p>Nenhum relatório encontrado.</p>
              {filtro || statusFiltro !== "todos" ? (
                <button
                  onClick={() => {
                    setFiltro("");
                    setStatusFiltro("todos");
                  }}
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="relatorios-table-container">
                <table className="relatorios-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Caso</th>
                      <th>Status</th>
                      <th>Data de Criação</th>
                      <th>Assinado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatoriosPaginados.map((relatorio) => (
                      <tr key={relatorio._id || `relatorio-${Math.random()}`}>
                        <td className="relatorio-titulo">
                          {relatorio.title || "Sem título"}
                        </td>
                        <td>
                          {relatorio.case ? (
                            <button
                              className="btn-ver-caso"
                              onClick={() => navegarParaCaso(relatorio.case)}
                            >
                              Ver caso
                            </button>
                          ) : (
                            "Caso não vinculado"
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${
                              relatorio.status || "indefinido"
                            }`}
                          >
                            {formatarStatus(relatorio.status)}
                          </span>
                        </td>
                        <td>{formatarData(relatorio.createdAt)}</td>
                        <td>
                          {/* Mostrar "Sim" para status finalizado e "Não" para rascunho */}
                          <span
                            className={
                              relatorio.status === "finalizado"
                                ? "assinado-sim"
                                : "assinado-nao"
                            }
                          >
                            {relatorio.status === "finalizado" ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td className="acoes-coluna">
                          <button
                            className="btn-acao"
                            onClick={() => exportarPDF(relatorio._id)}
                            title="Exportar como PDF"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            className="btn-acao btn-excluir"
                            onClick={() => abrirModalExcluir(relatorio)}
                            title="Excluir relatório"
                            disabled={excluindo[relatorio._id]}
                          >
                            {excluindo[relatorio._id] ? (
                              <span className="spinner"></span>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="paginacao">
                  <button
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="btn-pagina"
                  >
                    Anterior
                  </button>

                  <span className="pagina-info">
                    Página {paginaAtual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="btn-pagina"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </main>
        <MobileBottomNav />

        {/* Modal de confirmação de exclusão */}
        <ModalExcluirRelatorio
          isOpen={modalExcluirAberto}
          onClose={fecharModalExcluir}
          onConfirm={excluirRelatorio}
          relatorioId={relatorioParaExcluir?._id}
          relatorioTitulo={relatorioParaExcluir?.title}
        />
      </div>
    </ControleDeRota>
  );
}
