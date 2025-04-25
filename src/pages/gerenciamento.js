"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AsideNavBar from "@/components/AsideNavBar";
import "../styles/gerenciamento.css";
import Image from "next/image";
import { Pencil, Search, Bell, Trash2, CircleX } from "lucide-react";
import ModalEditarUsuario from "@/components/usuario/ModalEditarUsuario";
import ModalConfirmarExclusao from "@/components/usuario/ModalConfirmarExclusao";
import MobileBottomNav from "@/components/MobileBottomNav";
import ControleDeRota from "@/components/ControleDeRota";
import MobileHeader from "@/components/MobileHeader";

export default function Gerenciamento() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados para os modais
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  // Verificar autenticação e permissão
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role.toLowerCase() !== "admin") {
      router.push("/naoautorizado");
      return;
    }

    carregarUsuarios();
  }, [router]);

  // Função para carregar usuários da API
  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Token de autenticação não encontrado");
        setCarregando(false);
        return;
      }

      console.log("Iniciando busca de usuários...");

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Status da resposta:", response.status);
      console.log(
        "Headers da resposta:",
        Object.fromEntries([...response.headers.entries()])
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.status}`);
      }

      // Obter o texto da resposta primeiro para debug
      const responseText = await response.text();
      console.log("Resposta bruta:", responseText);

      // Tentar converter para JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Dados recebidos:", data);
      } catch (e) {
        console.error("Erro ao analisar JSON:", e);
        throw new Error("Resposta inválida da API");
      }

      // Verificar a estrutura da resposta
      if (Array.isArray(data)) {
        // Garantir que cada usuário tenha um ID único para a key do React
        const usuariosComId = data.map((usuario, index) => {
          if (!usuario._id && !usuario.id) {
            usuario._id = `generated-id-${index}`;
          }
          return usuario;
        });
        setUsuarios(usuariosComId);
      } else if (data.users && Array.isArray(data.users)) {
        const usuariosComId = data.users.map((usuario, index) => {
          if (!usuario._id && !usuario.id) {
            usuario._id = `generated-id-${index}`;
          }
          return usuario;
        });
        setUsuarios(usuariosComId);
      } else if (data.data && Array.isArray(data.data)) {
        const usuariosComId = data.data.map((usuario, index) => {
          if (!usuario._id && !usuario.id) {
            usuario._id = `generated-id-${index}`;
          }
          return usuario;
        });
        setUsuarios(usuariosComId);
      } else {
        console.error("Estrutura de dados inesperada:", data);
        setErro("Estrutura de dados inesperada na resposta da API");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Aplicar filtros quando mudar o filtro ativo ou termo de busca
  useEffect(() => {
    if (!usuarios.length) {
      console.log("Nenhum usuário disponível para filtrar");
      setUsuariosFiltrados([]);
      return;
    }

    console.log("Aplicando filtros aos usuários:", usuarios.length);

    let resultado = [...usuarios];

    // Aplicar filtro por tipo
    if (filtroAtivo !== "todos") {
      resultado = resultado.filter((usuario) => {
        const role = usuario.role ? usuario.role.toLowerCase() : "";
        const filtro = filtroAtivo.toLowerCase().slice(0, -1); // Remove o 's' do final (Peritos -> Perito)
        console.log(`Comparando role: ${role} com filtro: ${filtro}`);
        return role === filtro;
      });
    }

    // Aplicar filtro por termo de busca
    if (termoBusca) {
      resultado = resultado.filter(
        (usuario) =>
          (usuario.name &&
            usuario.name.toLowerCase().includes(termoBusca.toLowerCase())) ||
          (usuario.email &&
            usuario.email.toLowerCase().includes(termoBusca.toLowerCase()))
      );
    }

    console.log("Usuários filtrados:", resultado.length);
    setUsuariosFiltrados(resultado);
  }, [filtroAtivo, termoBusca, usuarios]);

  // Função para alternar o status do usuário
  async function alternarStatus(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token de autenticação não encontrado");
      return;
    }

    const usuario = usuarios.find((u) => u._id === id || u.id === id);
    if (!usuario) return;

    const novoStatus = usuario.active ? false : true;

    try {
      // Verificar a estrutura correta da URL
      const url = `https://perioscan-back-end-fhhq.onrender.com/api/users/${id}`;
      console.log("URL para alternar status:", url);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: novoStatus }),
      });

      console.log("Status da resposta (alternar status):", response.status);

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API (alternar status):", data);

      // Atualizar o usuário na lista
      setUsuarios(
        usuarios.map((u) => {
          if (u._id === id || u.id === id) {
            return { ...u, active: novoStatus };
          }
          return u;
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(`Erro ao atualizar status: ${error.message}`);
    }
  }

  // Função para abrir o modal de edição
  function abrirModalEditar(usuario) {
    console.log("Abrindo modal para editar usuário:", usuario);
    setUsuarioSelecionado(usuario);
    setModalEditarAberto(true);
  }

  // Função para abrir o modal de exclusão
  function abrirModalExcluir(usuario) {
    setUsuarioSelecionado(usuario);
    setModalExcluirAberto(true);
  }

  // Função para salvar usuário editado
  function salvarUsuarioEditado(usuarioAtualizado) {
    console.log("Usuário atualizado recebido:", usuarioAtualizado);

    // Verificar se o usuário atualizado tem a estrutura esperada
    if (usuarioAtualizado.data) {
      // Se a API retornar os dados dentro de um objeto 'data'
      usuarioAtualizado = usuarioAtualizado.data;
    }

    // Garantir que temos um ID válido para atualizar
    const userId = usuarioAtualizado._id || usuarioAtualizado.id;

    if (!userId) {
      console.error(
        "ID do usuário não encontrado no objeto atualizado:",
        usuarioAtualizado
      );
      // Mesmo sem ID, vamos tentar recarregar a lista para obter dados atualizados
      carregarUsuarios();
      return;
    }

    // Atualizar o usuário na lista local
    setUsuarios(
      usuarios.map((u) => {
        if ((u._id && u._id === userId) || (u.id && u.id === userId)) {
          // Preservar o ID original do usuário
          const idOriginal = u._id || u.id;
          return {
            ...usuarioAtualizado,
            _id: idOriginal, // Garantir que o ID original seja mantido
            id: idOriginal, // Garantir que ambos os campos de ID estejam presentes
          };
        }
        return u;
      })
    );

    // Recarregar a lista de usuários para garantir dados atualizados
    carregarUsuarios();
  }

  // Função para excluir usuário
  async function excluirUsuario() {
    if (!usuarioSelecionado) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token de autenticação não encontrado");
      return;
    }

    const userId = usuarioSelecionado._id || usuarioSelecionado.id;
    console.log("Excluindo usuário com ID:", userId);

    try {
      // Verificar a estrutura correta da URL
      const url = `https://perioscan-back-end-fhhq.onrender.com/api/users/${userId}`;
      console.log("URL para exclusão:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Adicionar Content-Type
        },
      });

      console.log("Status da resposta (exclusão):", response.status);

      // Verificar se o status é 204 (No Content) ou outro código de sucesso
      if (
        response.status === 204 ||
        (response.status >= 200 && response.status < 300)
      ) {
        console.log("Exclusão bem-sucedida com status:", response.status);

        // Remover o usuário da lista
        setUsuarios(
          usuarios.filter((u) => u._id !== userId && u.id !== userId)
        );
        setModalExcluirAberto(false);
        return;
      }

      // Se chegou aqui, houve um erro
      let errorMessage = `Erro ao excluir usuário: ${response.status}`;

      try {
        // Tentar obter detalhes do erro
        const errorData = await response.json();
        console.error("Detalhes do erro:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Se não conseguir ler o corpo da resposta, usa a mensagem padrão
        console.error("Não foi possível ler detalhes do erro:", e);
      }

      throw new Error(errorMessage);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert(`Erro ao excluir usuário: ${error.message}`);
      // Fechar o modal mesmo com erro, para evitar que o usuário fique preso
      setModalExcluirAberto(false);
    }
  }

  // Função para formatar o papel do usuário
  function formatarPapel(role) {
    if (!role) return "Desconhecido";

    const mapeamento = {
      admin: "Administrador",
      perito: "Perito",
      assistente: "Assistente",
    };
    return mapeamento[role.toLowerCase()] || role;
  }

  // Função para obter o ID do usuário (pode estar em _id ou id)
  function obterIdUsuario(usuario) {
    return usuario._id || usuario.id || "ID não disponível";
  }

  // Função para gerar uma chave única para cada linha da tabela
  function gerarChaveUnica(usuario, index) {
    return usuario._id || usuario.id || `usuario-sem-id-${index}`;
  }

  // Função para verificar se o usuário está ativo
  function isUsuarioAtivo(usuario) {
    // Se active for undefined, assume que está ativo
    return usuario.active !== false;
  }

  return (
    <ControleDeRota requiredRole="admin">
      <div className="gerenciamento-container">
        <MobileHeader></MobileHeader>
        <AsideNavBar />
        <MobileBottomNav></MobileBottomNav>

        <main className="gerenciamento-content">
          <header className="gerenciamento-header">
            <h1>Gerenciamento de usuários</h1>
            <div className="notificacao-icon">
              {/* <Bell alt="Icone de notificação" width={24} height={24} /> */}
            </div>
          </header>

          <div className="gerenciamento-filtros">
            <div className="filtro-tabs">
              <button
                className={filtroAtivo === "todos" ? "active" : ""}
                onClick={() => setFiltroAtivo("todos")}
              >
                Todos
              </button>
              <button
                className={filtroAtivo === "peritos" ? "active" : ""}
                onClick={() => setFiltroAtivo("peritos")}
              >
                Peritos
              </button>
              <button
                className={filtroAtivo === "assistentes" ? "active" : ""}
                onClick={() => setFiltroAtivo("assistentes")}
              >
                Assistentes
              </button>
            </div>

            <div className="busca-container">
              <input
                type="text"
                placeholder="Buscar usuário"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              <button className="busca-btn">
                <Search alt="Buscar" width={20} height={20} />
              </button>
            </div>
          </div>
          <div className="acoes-gerais">
            <button
              className="btn-adicionar-usuario"
              onClick={() => {
                const role = localStorage.getItem("role");
                if (role && role.toLowerCase() === "admin") {
                  router.push("/admincadastramento");
                } else {
                  router.push("/naoautorizado");
                }
              }}
            >
              <Image
                src="/images/icons/icone-adicionar.png"
                alt="Adicionar"
                width={20}
                height={20}
              />
              Adicionar Usuário
            </button>
          </div>

          {carregando ? (
            <div className="carregando">Carregando usuários...</div>
          ) : erro ? (
            <div className="erro">Erro ao carregar usuários: {erro}</div>
          ) : (
            <div className="tabela-container">
              <table className="tabela-usuarios">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Cargo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario, index) => (
                      <tr
                        key={gerarChaveUnica(usuario, index)}
                        className={
                          !isUsuarioAtivo(usuario) ? "usuario-inativo" : ""
                        }
                      >
                        <td className="id-cell">{obterIdUsuario(usuario)}</td>
                        <td>{usuario.name || "Nome não disponível"}</td>
                        <td>{usuario.email || "Email não disponível"}</td>
                        <td>{formatarPapel(usuario.role)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              isUsuarioAtivo(usuario) ? "ativo" : "inativo"
                            }`}
                          >
                            {isUsuarioAtivo(usuario) ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="acoes-cell">
                          <button
                            className="acao-btn editar"
                            onClick={() => abrirModalEditar(usuario)}
                            title="Editar usuário"
                          >
                            <Pencil alt="Editar" width={16} height={16} />
                          </button>
                          <button
                            className="acao-btn status"
                            onClick={() =>
                              alternarStatus(obterIdUsuario(usuario))
                            }
                            title={
                              isUsuarioAtivo(usuario)
                                ? "Desativar usuário"
                                : "Ativar usuário"
                            }
                          >
                            <CircleX
                              alt={
                                isUsuarioAtivo(usuario) ? "Desativar" : "Ativar"
                              }
                              width={16}
                              height={16}
                            />
                          </button>
                          <button
                            className="acao-btn excluir"
                            onClick={() => abrirModalExcluir(usuario)}
                            title="Excluir usuário"
                          >
                            <Trash2 alt="Excluir" width={16} height={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="nenhum-resultado">
                        {usuarios.length === 0
                          ? "Nenhum usuário encontrado. Verifique a conexão com a API."
                          : "Nenhum usuário encontrado com os filtros aplicados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Modal de Edição */}
        {modalEditarAberto && (
          <ModalEditarUsuario
            usuario={usuarioSelecionado}
            onClose={() => setModalEditarAberto(false)}
            onSave={salvarUsuarioEditado}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExcluirAberto && (
          <ModalConfirmarExclusao
            usuario={usuarioSelecionado}
            onClose={() => setModalExcluirAberto(false)}
            onConfirm={excluirUsuario}
          />
        )}
      </div>
    </ControleDeRota>
  );
}
