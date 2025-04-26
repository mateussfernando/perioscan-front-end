"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AsideNavBar from "@/components/AsideNavBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ControleDeRota from "@/components/ControleDeRota";
import ModalExcluirRelatorio from "@/components/casos/ModalExcluirRelatorio";
import "../styles/relatorios.css";
import MobileHeader from "@/components/MobileHeader";

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
  const router = useRouter();

  // Estados
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

  // Buscar relatórios
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
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);

      const dados = await resposta.json();

      if (Array.isArray(dados.data)) {
        setRelatorios(dados.data);
      } else if (Array.isArray(dados.reports)) {
        setRelatorios(dados.reports);
      } else {
        setRelatorios([]);
        setErro("Formato de dados inválido");
      }
    } catch (erro) {
      console.error("Erro:", erro);
      setErro("Falha ao carregar relatórios");
      setRelatorios([]);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  // Efeitos
  useEffect(() => {
    buscarRelatorios();
  }, []);

  useEffect(() => {
    if (mensagemSucesso) {
      const timer = setTimeout(() => setMensagemSucesso(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagemSucesso]);

  // Exportar PDF
  const exportarPDF = async (relatorioId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");

      const resposta = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resposta.ok) throw new Error("Falha ao exportar");

      const blob = await resposta.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${relatorioId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Falha ao exportar PDF");
    }
  };

  // Verificar se um relatório está assinado
  const verificarRelatorioAssinado = (relatorio) => {
    return (
      relatorio.status?.toLowerCase() === "assinado" ||
      relatorio.status?.toLowerCase() === "finalizado" ||
      !!relatorio.digitalSignature ||
      !!relatorio.signed
    );
  };

  // Excluir relatório
  const excluirRelatorio = async (relatorioId) => {
    // Encontrar o relatório na lista
    const relatorio = relatorios.find((r) => r._id === relatorioId);

    // Verificar se o relatório está assinado
    if (relatorio && verificarRelatorioAssinado(relatorio)) {
      alert("Não é possível excluir um relatório assinado ou finalizado.");
      setModalExcluirAberto(false);
      return;
    }

    try {
      setExcluindo((prev) => ({ ...prev, [relatorioId]: true }));

      const token = localStorage.getItem("token");
      if (!token) return router.push("/");

      // Garantir que o ID seja uma string válida
      const id = relatorioId.toString().trim();

      console.log(`Tentando excluir relatório com ID: ${id}`);

      const resposta = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Verificar resposta detalhada
      const responseText = await resposta.text();
      console.log(
        `Resposta da API ao excluir: Status ${resposta.status}, Corpo:`,
        responseText
      );

      if (!resposta.ok) {
        // Tentar extrair a mensagem de erro da resposta
        let mensagemErro = `Falha ao excluir: ${resposta.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            mensagemErro = errorData.message;
          }
        } catch (e) {
          // Ignorar erro de parsing
        }
        throw new Error(mensagemErro);
      }

      setRelatorios((prev) => prev.filter((r) => r._id !== relatorioId));
      setMensagemSucesso("Relatório excluído com sucesso!");
      buscarRelatorios();
    } catch (erro) {
      console.error("Erro:", erro);
      alert(`Erro ao excluir relatório: ${erro.message}`);
    } finally {
      setExcluindo((prev) => ({ ...prev, [relatorioId]: false }));
    }
  };

  // Navegação para caso
  const navegarParaCaso = (casoId) => {
    const id = casoId?._id || casoId;
    if (id) router.push(`/casos/${id}`);
    else alert("ID do caso inválido");
  };

  // Filtragem e ordenação
  const relatoriosFiltrados = relatorios
    .filter((relatorio) => {
      const busca = filtro.toLowerCase();
      return (
        (relatorio.title?.toLowerCase().includes(busca) ||
          relatorio.content?.toLowerCase().includes(busca)) &&
        (statusFiltro === "todos" || relatorio.status === statusFiltro)
      );
    })
    .sort((a, b) => {
      if (ordenacao === "recentes")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (ordenacao === "antigos")
        return new Date(a.createdAt) - new Date(b.createdAt);
      return a.title?.localeCompare(b.title);
    });

  // Paginação
  const indicePrimeiroItem = (paginaAtual - 1) * itensPorPagina;
  const relatoriosPaginados = relatoriosFiltrados.slice(
    indicePrimeiroItem,
    indicePrimeiroItem + itensPorPagina
  );
  const totalPaginas = Math.ceil(relatoriosFiltrados.length / itensPorPagina);

  // Formatação
  const formatarData = (dataString) => {
    try {
      return new Date(dataString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  // Atualizar a função formatarStatus para lidar corretamente com todos os status possíveis
  const formatarStatus = (status) => {
    if (!status) return "Rascunho";

    const statusLower = status.toLowerCase();
    const statusMap = {
      rascunho: "Rascunho",
      finalizado: "Finalizado",
      assinado: "Assinado",
      "em andamento": "Em Andamento",
      "em-andamento": "Em Andamento",
      pendente: "Pendente",
      arquivado: "Arquivado",
      cancelado: "Cancelado",
    };

    return (
      statusMap[statusLower] || status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  return (
    <ControleDeRota>
      <MobileHeader></MobileHeader>
      <div className="relatorios-page">
        <AsideNavBar />

        <main className="relatorios-content">
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
                onClick={buscarRelatorios}
                disabled={carregando || atualizando}
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
                  <option value="todos">Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="assinado">Assinado</option>
                </select>
              </div>

              <div className="filtro-ordenacao">
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                >
                  <option value="recentes">Recentes</option>
                  <option value="antigos">Antigos</option>
                  <option value="alfabetica">A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="relatorios-loading">
              <p>Carregando...</p>
            </div>
          ) : erro ? (
            <div className="relatorios-error">
              <FileText size={24} />
              <p>{erro}</p>
            </div>
          ) : relatoriosFiltrados.length === 0 ? (
            <div className="relatorios-empty">
              <FileText size={48} />
              <p>Nenhum relatório encontrado</p>
              {(filtro || statusFiltro !== "todos") && (
                <button
                  onClick={() => {
                    setFiltro("");
                    setStatusFiltro("todos");
                  }}
                >
                  Limpar filtros
                </button>
              )}
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
                      <th>Criação</th>
                      <th>Assinado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatoriosPaginados.map((relatorio) => (
                      <tr key={relatorio._id}>
                        <td data-label="Título">
                          {relatorio.title || "Sem título"}
                        </td>

                        <td data-label="Caso">
                          {relatorio.case ? (
                            <button
                              className="btn-ver-caso"
                              onClick={() => navegarParaCaso(relatorio.case)}
                            >
                              Ver caso
                            </button>
                          ) : (
                            "Não vinculado"
                          )}
                        </td>

                        <td data-label="Status">
                          <span
                            className={`status-badge status-${relatorio.status}`}
                          >
                            {formatarStatus(relatorio.status)}
                          </span>
                        </td>

                        <td data-label="Criação">
                          {formatarData(relatorio.createdAt)}
                        </td>

                        <td data-label="Assinado">
                          <span
                            className={
                              verificarRelatorioAssinado(relatorio)
                                ? "assinado-sim"
                                : "assinado-nao"
                            }
                          >
                            {verificarRelatorioAssinado(relatorio)
                              ? "Sim"
                              : "Não"}
                          </span>
                        </td>

                        <td className="acoes-coluna" data-label="Ações">
                          <button
                            className="btn-acao"
                            onClick={() => exportarPDF(relatorio._id)}
                            title="Exportar PDF"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            className="btn-acao btn-excluir"
                            onClick={() => {
                              // Verificar se o relatório está assinado antes de abrir o modal
                              if (verificarRelatorioAssinado(relatorio)) {
                                alert(
                                  "Não é possível excluir um relatório assinado ou finalizado."
                                );
                                return;
                              }
                              setRelatorioParaExcluir(relatorio);
                              setModalExcluirAberto(true);
                            }}
                            disabled={
                              excluindo[relatorio._id] ||
                              verificarRelatorioAssinado(relatorio)
                            }
                            title={
                              verificarRelatorioAssinado(relatorio)
                                ? "Não é possível excluir relatórios assinados"
                                : "Excluir Relatório"
                            }
                          >
                            {excluindo[relatorio._id] ? (
                              <span className="spinner" />
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

              {totalPaginas > 1 && (
                <div className="paginacao">
                  <button
                    onClick={() => setPaginaAtual((p) => p - 1)}
                    disabled={paginaAtual === 1}
                    className="btn-pagina"
                  >
                    Anterior
                  </button>

                  <span className="pagina-info">
                    Página {paginaAtual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() => setPaginaAtual((p) => p + 1)}
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

        <ModalExcluirRelatorio
          isOpen={modalExcluirAberto}
          onClose={() => setModalExcluirAberto(false)}
          onConfirm={(id) => {
            excluirRelatorio(id);
            setModalExcluirAberto(false);
          }}
          relatorioId={relatorioParaExcluir?._id}
          relatorioTitulo={relatorioParaExcluir?.title}
        />
      </div>
    </ControleDeRota>
  );
}
