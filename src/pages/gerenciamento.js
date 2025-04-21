"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AsideNavBar from "@/components/AsideNavBar"
import "../styles/gerenciamento.css"
import Image from "next/image"

export default function Gerenciamento() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [filtroAtivo, setFiltroAtivo] = useState("todos")
  const [termoBusca, setTermoBusca] = useState("")
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // Verificar autenticação e permissão
  useEffect(() => {
    const role = localStorage.getItem("role")
    if (!role || role.toLowerCase() !== "admin") {
      router.push("/naoautorizado")
      return
    }

    // Buscar dados da API
    const token = localStorage.getItem("token")
    if (!token) {
      setErro("Token de autenticação não encontrado")
      setCarregando(false)
      return
    }

    console.log("Iniciando busca de usuários...")

    fetch("https://perioscan-back-end-fhhq.onrender.com/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Status da resposta:", response.status)
        if (!response.ok) {
          throw new Error(`Erro ao buscar usuários: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("Dados recebidos:", data)

        // Verificar a estrutura da resposta
        if (Array.isArray(data)) {
          setUsuarios(data)
        } else if (data.users && Array.isArray(data.users)) {
          // Se os usuários estiverem em uma propriedade 'users'
          setUsuarios(data.users)
        } else if (data.data && Array.isArray(data.data)) {
          // Se os usuários estiverem em uma propriedade 'data'
          setUsuarios(data.data)
        } else {
          console.error("Estrutura de dados inesperada:", data)
          setErro("Estrutura de dados inesperada na resposta da API")
        }

        setCarregando(false)
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error)
        setErro(error.message)
        setCarregando(false)
      })
  }, [router])

  // Aplicar filtros quando mudar o filtro ativo ou termo de busca
  useEffect(() => {
    if (!usuarios.length) {
      console.log("Nenhum usuário disponível para filtrar")
      setUsuariosFiltrados([])
      return
    }

    console.log("Aplicando filtros aos usuários:", usuarios.length)

    let resultado = [...usuarios]

    // Aplicar filtro por tipo
    if (filtroAtivo !== "todos") {
      resultado = resultado.filter((usuario) => {
        const role = usuario.role ? usuario.role.toLowerCase() : ""
        const filtro = filtroAtivo.toLowerCase().slice(0, -1) // Remove o 's' do final (Peritos -> Perito)
        console.log(`Comparando role: ${role} com filtro: ${filtro}`)
        return role === filtro
      })
    }

    // Aplicar filtro por termo de busca
    if (termoBusca) {
      resultado = resultado.filter(
        (usuario) =>
          (usuario.name && usuario.name.toLowerCase().includes(termoBusca.toLowerCase())) ||
          (usuario.email && usuario.email.toLowerCase().includes(termoBusca.toLowerCase())),
      )
    }

    console.log("Usuários filtrados:", resultado.length)
    setUsuariosFiltrados(resultado)
  }, [filtroAtivo, termoBusca, usuarios])

  // Função para alternar o status do usuário
  function alternarStatus(id) {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Token de autenticação não encontrado")
      return
    }

    const usuario = usuarios.find((u) => u._id === id || u.id === id)
    if (!usuario) return

    const novoStatus = usuario.active ? false : true

    fetch(`https://perioscan-back-end-fhhq.onrender.com/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: novoStatus }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao atualizar status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // Atualizar o usuário na lista
        setUsuarios(
          usuarios.map((u) => {
            if (u._id === id || u.id === id) {
              return { ...u, active: novoStatus }
            }
            return u
          }),
        )
      })
      .catch((error) => {
        console.error("Erro ao atualizar status:", error)
        alert(`Erro ao atualizar status: ${error.message}`)
      })
  }

  // Função para editar usuário
  function editarUsuario(id) {
    // Implementação futura - abrir modal de edição
    alert(`Editar usuário com ID: ${id}`)
  }

  // Função para excluir usuário
  function excluirUsuario(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Token de autenticação não encontrado")
      return
    }

    fetch(`https://perioscan-back-end-fhhq.onrender.com/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao excluir usuário: ${response.status}`)
        }
        return response.json()
      })
      .then(() => {
        // Remover o usuário da lista
        setUsuarios(usuarios.filter((u) => u._id !== id && u.id !== id))
      })
      .catch((error) => {
        console.error("Erro ao excluir usuário:", error)
        alert(`Erro ao excluir usuário: ${error.message}`)
      })
  }

  // Função para formatar o papel do usuário
  function formatarPapel(role) {
    if (!role) return "Desconhecido"

    const mapeamento = {
      admin: "Administrador",
      perito: "Perito",
      assistente: "Assistente",
    }
    return mapeamento[role.toLowerCase()] || role
  }

  // Função para obter o ID do usuário (pode estar em _id ou id)
  function obterIdUsuario(usuario) {
    return usuario._id || usuario.id || "ID não disponível"
  }

  // Função para verificar se o usuário está ativo
  function isUsuarioAtivo(usuario) {
    // Se active for undefined, assume que está ativo
    return usuario.active !== false
  }

  return (
    <div className="gerenciamento-container">
      <AsideNavBar />

      <main className="gerenciamento-content">
        <header className="gerenciamento-header">
          <h1>Gerenciamento de usuários</h1>
          <div className="notificacao-icon">
            <Image src="/images/icons/icone-notificacao.png" alt="Notificações" width={24} height={24} />
          </div>
        </header>

        <div className="gerenciamento-filtros">
          <div className="filtro-tabs">
            <button className={filtroAtivo === "todos" ? "active" : ""} onClick={() => setFiltroAtivo("todos")}>
              Todos
            </button>
            <button className={filtroAtivo === "peritos" ? "active" : ""} onClick={() => setFiltroAtivo("peritos")}>
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
              <Image src="/images/icons/icone-busca.png" alt="Buscar" width={20} height={20} />
            </button>
          </div>
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
                  usuariosFiltrados.map((usuario) => (
                    <tr key={obterIdUsuario(usuario)} className={!isUsuarioAtivo(usuario) ? "usuario-inativo" : ""}>
                      <td className="id-cell">{obterIdUsuario(usuario)}</td>
                      <td>{usuario.name || "Nome não disponível"}</td>
                      <td>{usuario.email || "Email não disponível"}</td>
                      <td>{formatarPapel(usuario.role)}</td>
                      <td>
                        <span className={`status-badge ${isUsuarioAtivo(usuario) ? "ativo" : "inativo"}`}>
                          {isUsuarioAtivo(usuario) ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="acoes-cell">
                        <button
                          className="acao-btn editar"
                          onClick={() => editarUsuario(obterIdUsuario(usuario))}
                          title="Editar usuário"
                        >
                          <Image src="/images/icons/icone-editar.png" alt="Editar" width={16} height={16} />
                        </button>
                        <button
                          className="acao-btn status"
                          onClick={() => alternarStatus(obterIdUsuario(usuario))}
                          title={isUsuarioAtivo(usuario) ? "Desativar usuário" : "Ativar usuário"}
                        >
                          <Image
                            src={
                              isUsuarioAtivo(usuario)
                                ? "/images/icons/icone-desativar.png"
                                : "/images/icons/icone-ativar.png"
                            }
                            alt={isUsuarioAtivo(usuario) ? "Desativar" : "Ativar"}
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          className="acao-btn excluir"
                          onClick={() => excluirUsuario(obterIdUsuario(usuario))}
                          title="Excluir usuário"
                        >
                          <Image src="/images/icons/icone-excluir.png" alt="Excluir" width={16} height={16} />
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

        <div className="acoes-gerais">
          <button className="btn-adicionar-usuario">
            <Image src="/images/icons/icone-adicionar-usuario.png" alt="Adicionar" width={20} height={20} />
            Adicionar Usuário
          </button>
        </div>
      </main>
    </div>
  )
}
