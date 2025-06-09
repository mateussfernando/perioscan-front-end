"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import AsideNavBar from "@/components/AsideNavBar"
import "../styles/casos.css"
import MobileHeader from "@/components/MobileHeader"

import { Eye, Plus, X, Loader, MapPin, FileText, Search, Calendar, User, UserPlus } from "lucide-react"
import MobileBottomNav from "@/components/MobileBottomNav"
import ControleDeRota from "@/components/ControleDeRota"
import ModalAdicionarVitima from "@/components/casos/ModalAdicionarVitima"

export default function MainCasos() {
  const [casos, setCasos] = useState([])
  const [casosFiltrados, setCasosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState("")
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [novoCaso, setNovoCaso] = useState({
    title: "",
    description: "",
    location: "",
    status: "em andamento",
    occurrenceDate: "",
    type: "outro",
    tipoPersonalizado: "",
    victim: {
      nic: "",
      name: "",
      gender: "",
      age: "",
      birthDate: "",
      estimatedAge: {
        min: "",
        max: "",
        methodology: "",
      },
      document: {
        type: "",
        number: "",
      },
      ethnicity: "não_declarada",
      identificationType: "",
      referenceCode: "",
    },
  })
  const [criandoCaso, setCriandoCaso] = useState(false)
  const [erroCriacao, setErroCriacao] = useState(null)
  const [termoBusca, setTermoBusca] = useState("")
  const [filtroAtivo, setFiltroAtivo] = useState("todos")
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    status: "",
    dataInicio: "",
    dataFim: "",
    criadoPor: "",
  })
  const [abaAtiva, setAbaAtiva] = useState("caso")
  const [adicionarVitima, setAdicionarVitima] = useState(false)
  const [msgVitima, setMsgVitima] = useState("")
  const [salvandoVitima, setSalvandoVitima] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    setUserRole(role || "")

    if (!token) {
      router.push("/login")
      return
    }

    async function fetchCasos() {
      try {
        console.log("Iniciando busca de casos...")

        const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/cases", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Resposta recebida:", response)

        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        if (response.status === 404) {
          setError("Endpoint não encontrado (404) - Verifique a URL da API")
          setCasos([])
          return
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`)
        }

        const textData = await response.text()
        console.log("Resposta em texto:", textData)

        const responseObject = textData ? JSON.parse(textData) : {}
        console.log("Dados recebidos:", responseObject)

        // Verificar se a resposta tem a propriedade 'data' e é um array
        if (responseObject.success && Array.isArray(responseObject.data)) {
          // Adicionar log para verificar os status dos casos recebidos
          const statusList = responseObject.data.map((caso) => caso.status)
          console.log("Status dos casos recebidos:", statusList)

          setCasos(responseObject.data)
          setCasosFiltrados(responseObject.data)
        } else {
          console.error("Formato de resposta inesperado:", responseObject)
          setCasos([])
          setCasosFiltrados([])
        }

        setError(null)
      } catch (error) {
        console.error("Erro completo:", error)
        setError(`Falha ao carregar casos: ${error.message}`)
        setCasos([])
        setCasosFiltrados([])
      } finally {
        setLoading(false)
      }
    }

    fetchCasos()
  }, [router])

  // Efeito para filtrar casos quando os filtros ou termo de busca mudam
  useEffect(() => {
    filtrarCasos()
  }, [casos, termoBusca, filtrosAtivos, filtroAtivo])

  // Função para filtrar casos
  const filtrarCasos = () => {
    if (!casos.length) {
      setCasosFiltrados([])
      return
    }

    // Fazer uma cópia dos casos para não modificar o original
    let resultado = [...casos]

    // Filtrar por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase()
      resultado = resultado.filter(
        (caso) =>
          (caso.title && caso.title.toLowerCase().includes(termo)) ||
          (caso.location && caso.location.toLowerCase().includes(termo)),
      )
    }

    // Filtrar por status - aceitar variações comuns
    if (filtrosAtivos.status) {
      const statusFiltro = filtrosAtivos.status.toLowerCase().replace(/[^a-z]/g, '')
      resultado = resultado.filter((caso) => {
        const casoStatus = (caso.status || '').toLowerCase().replace(/[^a-z]/g, '')
        // Aceita variações como 'emandamento', 'em_andamento', 'andamento', etc.
        if (statusFiltro === 'emandamento') {
          return (
            casoStatus === 'emandamento' ||
            casoStatus === 'em_andamento' ||
            casoStatus === 'andamento'
          )
        }
        if (statusFiltro === 'finalizado') {
          return casoStatus === 'finalizado'
        }
        if (statusFiltro === 'arquivado') {
          return casoStatus === 'arquivado'
        }
        return casoStatus === statusFiltro
      })
    }

    // Filtrar por data de abertura
    if (filtrosAtivos.dataInicio) {
      const dataInicio = new Date(filtrosAtivos.dataInicio)
      resultado = resultado.filter((caso) => {
        const dataCaso = new Date(caso.openDate)
        return dataCaso >= dataInicio
      })
    }

    if (filtrosAtivos.dataFim) {
      const dataFim = new Date(filtrosAtivos.dataFim)
      dataFim.setHours(23, 59, 59, 999) // Fim do dia
      resultado = resultado.filter((caso) => {
        const dataCaso = new Date(caso.openDate)
        return dataCaso <= dataFim
      })
    }

    // Filtrar por criador
    if (filtrosAtivos.criadoPor) {
      const termoCriador = filtrosAtivos.criadoPor.toLowerCase()
      resultado = resultado.filter(
        (caso) => caso.createdBy?.name && caso.createdBy.name.toLowerCase().includes(termoCriador),
      )
    }

    setCasosFiltrados(resultado)
  }

  // Funções para lidar com busca e filtros
  const handleSearch = (termo) => {
    setTermoBusca(termo)
  }

  const handleFilter = (filtros) => {
    setFiltrosAtivos(filtros)
  }

  // Verifica se o usuário tem permissão para criar casos
  const podeAdicionarCaso = () => {
    return userRole === "admin" || userRole === "perito"
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "--"
    const data = new Date(dataISO)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para visualizar detalhes de um caso
  const verDetalhesCaso = (id) => {
    // Navegar para a página de detalhes do caso
    router.push(`/casos/${id}`)
  }

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    if (!status) return "status-desconhecido"

    // Normalize o status para minúsculas e sem espaços
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-")

    switch (normalizedStatus) {
      case "em-andamento":
        return "status-em-andamento"
      case "finalizado":
        return "status-finalizado"
      case "pendente":
        return "status-pendente"
      case "arquivado":
        return "status-arquivado"
      case "cancelado":
        return "status-cancelado"
      default:
        return "status-outro"
    }
  }

  // Função para formatar o tipo do caso
  const formatarTipoCaso = (tipo) => {
    if (!tipo) return "Outro"

    const tipos = {
      acidente: "Acidente",
      "identificação de vítima": "Identificação de Vítima",
      "exame criminal": "Exame Criminal",
      outro: "Outro",
    }

    return tipos[tipo] || tipo
  }

  // Função para abrir o modal de novo caso
  const abrirModalNovo = () => {
    if (!podeAdicionarCaso()) {
      alert("Apenas administradores e peritos podem criar novos casos.")
      return
    }

    setNovoCaso({
      title: "",
      description: "",
      location: "",
      status: "em andamento",
      occurrenceDate: "",
      type: "outro",
      tipoPersonalizado: "",
      victim: {
        nic: "",
        name: "",
        gender: "",
        age: "",
        birthDate: "",
        estimatedAge: {
          min: "",
          max: "",
          methodology: "",
        },
        document: {
          type: "",
          number: "",
        },
        ethnicity: "não_declarada",
        identificationType: "",
        referenceCode: "",
      },
    })
    setErroCriacao(null)
    setModalNovoAberto(true)
  }

  // Função para fechar o modal de novo caso
  const fecharModalNovo = () => {
    setModalNovoAberto(false)
  }

  // Função para lidar com mudanças nos campos do formulário
  const handleCasoChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("victim.")) {
      const fieldPath = name.split(".")
      setNovoCaso((prev) => {
        const newState = { ...prev }
        let current = newState

        for (let i = 0; i < fieldPath.length - 1; i++) {
          if (!current[fieldPath[i]]) {
            current[fieldPath[i]] = {}
          }
          current = current[fieldPath[i]]
        }

        current[fieldPath[fieldPath.length - 1]] = value
        return newState
      })
    } else {
      setNovoCaso((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Função para criar um novo caso
  const criarCaso = async (e) => {
    e.preventDefault()

    if (!novoCaso.title) {
      setErroCriacao("O título do caso é obrigatório.")
      return
    }

    setCriandoCaso(true)
    setErroCriacao(null)

    try {
      const token = localStorage.getItem("token")

      // Preparar os dados para envio, tratando o tipo personalizado
      const dadosParaEnviar = { ...novoCaso }

      // Se o tipo for "outro" e houver um valor personalizado, use-o como tipo
      if (novoCaso.type === "outro" && novoCaso.tipoPersonalizado.trim()) {
        dadosParaEnviar.type = novoCaso.tipoPersonalizado.trim()
      }

      // Remover o campo tipoPersonalizado antes de enviar para o backend
      delete dadosParaEnviar.tipoPersonalizado

      // Log detalhado para depuração
      console.log("Enviando dados do novo caso:", JSON.stringify(dadosParaEnviar, null, 2))
      console.log("Status sendo enviado:", dadosParaEnviar.status)

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/cases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      })

      // Capturar a resposta completa para debug
      const responseText = await response.text()
      console.log("Resposta bruta da criação do caso:", responseText)

      if (!response.ok) {
        console.error("Resposta de erro ao criar caso:", responseText)
        throw new Error(`Falha ao criar caso: ${response.status} ${response.statusText}`)
      }

      // Tentar analisar a resposta como JSON
      let casoCriado
      try {
        casoCriado = JSON.parse(responseText)
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação do caso:", e)
        // Continuar mesmo com erro de parsing
      }

      console.log("Caso criado com sucesso:", casoCriado)

      // Fechar o modal
      fecharModalNovo()

      // Recarregar a lista de casos
      const casosResponse = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/cases", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (casosResponse.ok) {
        const casosData = await casosResponse.json()
        if (casosData.success && Array.isArray(casosData.data)) {
          setCasos(casosData.data)
          setCasosFiltrados(casosData.data)
        }
      }
    } catch (error) {
      console.error("Erro ao criar caso:", error)
      setErroCriacao(`Falha ao criar caso: ${error.message}`)
    } finally {
      setCriandoCaso(false)
    }
  }

  // Função para submit da vítima
  async function handleSubmitVitima(e) {
    e.preventDefault();
    setMsgVitima("");
    setSalvandoVitima(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: novoCaso.victim.name,
        identificationType: novoCaso.victim.identificationType,
        birthDate: novoCaso.victim.birthDate,
      };
      if (novoCaso.victim.identificationType === "não identificada") {
        payload.referenceCode = novoCaso.victim.referenceCode;
      }
      // Adicionar o caseId se estiver disponível
      if (params?.id) {
        payload.caseId = params.id;
      }
      // Remove campos vazios
      Object.keys(payload).forEach((k) => (payload[k] === "" || payload[k] == null) && delete payload[k]);
      // Validação mínima
      if (!payload.identificationType) throw new Error("Tipo de identificação é obrigatório");
      if (payload.identificationType === "identificada" && !payload.name) throw new Error("Nome é obrigatório para identificada");
      if (!payload.birthDate) throw new Error("Data de nascimento é obrigatória");
      if (payload.identificationType === "não identificada" && !payload.referenceCode) throw new Error("Código de referência é obrigatório para não identificada");
      // Envio
      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/victims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao criar vítima");
      }
      setMsgVitima("Vítima criada com sucesso!");
      // Limpar formulário
      setTimeout(() => {
        setMsgVitima("");
        fecharModalNovo();
        window.location.reload();
      }, 1200);
    } catch (err) {
      setMsgVitima(err.message || "Erro ao criar vítima");
    } finally {
      setSalvandoVitima(false);
    }
  }

  return (
    <ControleDeRota>
      <MobileHeader></MobileHeader>
      <div className="casos-container">
        <AsideNavBar />
        <MobileBottomNav></MobileBottomNav>

        <main className="casos-content">
          <header className="casos-header">
            <h1>Gerenciamento de Casos</h1>
            <div className="notificacao-icon">{/* <Bell size={24} /> */}</div>
          </header>

          <div className="casos-filtros">
            <div className="filtro-tabs">
              <button
                className={filtroAtivo === "todos" ? "active" : ""}
                onClick={() => {
                  setFiltroAtivo("todos")
                  setFiltrosAtivos({ ...filtrosAtivos, status: "" })
                }}
              >
                Todos
              </button>
              <button
                className={filtroAtivo === "andamento" ? "active" : ""}
                onClick={() => {
                  setFiltroAtivo("andamento")
                  setFiltrosAtivos({
                    ...filtrosAtivos,
                    status: "em andamento",
                  }) // Valor correto em minúsculas
                }}
              >
                Em Andamento
              </button>
              <button
                className={filtroAtivo === "finalizados" ? "active" : ""}
                onClick={() => {
                  setFiltroAtivo("finalizados")
                  setFiltrosAtivos({ ...filtrosAtivos, status: "finalizado" }) // Valor correto em minúsculas
                }}
              >
                Finalizados
              </button>
            </div>

            <div className="busca-container">
              <input
                type="text"
                placeholder="Buscar caso..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              <button className="busca-btn">
                <Search size={20} />
              </button>
            </div>
          </div>

          <div className="acoes-topo">
            <button
              className={`btn-novo-caso ${!podeAdicionarCaso() ? "btn-disabled" : ""}`}
              onClick={abrirModalNovo}
              disabled={!podeAdicionarCaso()}
              title={!podeAdicionarCaso() ? "Apenas administradores e peritos podem criar casos" : "Criar novo caso"}
            >
              <Plus size={16} />
              Novo caso
            </button>
          </div>

          {loading ? (
            <div className="carregando">Carregando casos...</div>
          ) : error ? (
            <div className="erro">Erro ao carregar casos: {error}</div>
          ) : (
            <div className="tabela-container">
              <table className="tabela-casos">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Vítima</th>
                    <th>Tipo</th>
                    <th>Local</th>
                    <th>Data abertura</th>
                    <th>Data fechamento</th>
                    <th>Criado por</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {casosFiltrados.length > 0 ? (
                    casosFiltrados.map((caso) => (
                      <tr key={caso._id}>
                        <td>{caso.title || "--"}</td>
                        <td>
                          {caso.victim?.name ? (
                            <div className="victim-info">
                              <div className="victim-name">{caso.victim.name}</div>
                              {caso.victim.identificationType && (
                                <div className="victim-status">
                                  <span
                                    className={`identificacao-${caso.victim.identificationType?.replace("_", "-")}`}
                                  >
                                    {caso.victim.identificationType === "identificada" ? "ID" : "NÃO ID"}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td>{formatarTipoCaso(caso.type) || "--"}</td>
                        <td>{caso.location || "--"}</td>
                        <td>{formatarData(caso.openDate)}</td>
                        <td>{formatarData(caso.closeDate)}</td>
                        <td>{caso.createdBy?.name || "--"}</td>
                        <td>
                          <span className={`status-badge ${getStatusClassName(caso.status)}`}>
                            {caso.status || "--"}
                          </span>
                        </td>
                        <td className="acoes-cell">
                          <button
                            className="acao-btn ver"
                            onClick={() => verDetalhesCaso(caso._id)}
                            title="Ver detalhes do caso"
                          >
                            Ver caso
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="nenhum-resultado">
                        {casos.length === 0
                          ? "Nenhum caso encontrado."
                          : "Nenhum caso corresponde aos filtros aplicados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Modal para criar novo caso */}
        {modalNovoAberto && (
          <div className="modal-overlay" onClick={fecharModalNovo}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
              <div className="modal-header">
                <h3>Criar Novo Caso</h3>
                <button className="btn-fechar-modal" onClick={fecharModalNovo}>
                  <X size={20} />
                </button>
              </div>

              {/* Navegação de abas sempre visível */}
              <div style={{ display: 'flex', gap: 8, margin: '0 0 16px 0', padding: '0 24px' }}>
                <button
                  className="btn-adicionar-vitima"
                  style={{
                    background: abaAtiva === 'caso' ? '#000' : '#fff',
                    color: abaAtiva === 'caso' ? '#fff' : '#000',
                    border: abaAtiva === 'caso' ? 'none' : '1px solid #ccc',
                    borderRadius: 4,
                    padding: '10px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onClick={() => setAbaAtiva('caso')}
                >
                  <FileText style={{ color: abaAtiva === 'caso' ? '#fff' : '#000' }} size={18} />
                  Adicionar Caso
                </button>
                <button
                  className="btn-adicionar-vitima"
                  style={{
                    background: abaAtiva === 'vitima' ? '#000' : '#fff',
                    color: abaAtiva === 'vitima' ? '#fff' : '#000',
                    border: abaAtiva === 'vitima' ? 'none' : '1px solid #ccc',
                    borderRadius: 4,
                    padding: '10px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: adicionarVitima ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    opacity: adicionarVitima ? 1 : 0.5,
                    pointerEvents: adicionarVitima ? 'auto' : 'none',
                    transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                  }}
                  onClick={() => { if (adicionarVitima) setAbaAtiva('vitima'); }}
                  disabled={!adicionarVitima}
                >
                  <User style={{ color: abaAtiva === 'vitima' ? '#fff' : '#000' }} size={18} />
                  Adicionar Vítima
                </button>
              </div>

              {/* Conteúdo dinâmico das abas */}
              <div style={{ padding: 24 }}>
                {abaAtiva === 'caso' && (
                  <form onSubmit={criarCaso} className="form-novo-caso">
                    {/* Seletor para adicionar vítima */}
                    <div className="form-group">
                      <label>Deseja adicionar vítima?</label>
                      <select
                        value={adicionarVitima ? 'sim' : 'nao'}
                        onChange={e => {
                          const val = e.target.value === 'sim';
                          setAdicionarVitima(val);
                          if (!val && abaAtiva === 'vitima') setAbaAtiva('caso');
                        }}
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
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
                    {/* Tipo do caso */}
                    <div className="form-group">
                      <label htmlFor="type">Tipo do Caso</label>
                      <select id="type" name="type" value={novoCaso.type} onChange={handleCasoChange}>
                        <option value="acidente">Acidente</option>
                        <option value="identificação de vítima">Identificação de Vítima</option>
                        <option value="exame criminal">Exame Criminal</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    {/* Campo para tipo personalizado - aparece apenas quando "outro" está selecionado */}
                    {novoCaso.type === "outro" && (
                      <div className="form-group">
                        <label htmlFor="tipoPersonalizado">Especifique o Tipo</label>
                        <input
                          type="text"
                          id="tipoPersonalizado"
                          name="tipoPersonalizado"
                          value={novoCaso.tipoPersonalizado}
                          onChange={handleCasoChange}
                          placeholder="Digite o tipo específico do caso"
                        />
                      </div>
                    )}
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
                    {/* Data da Ocorrência */}
                    <div className="form-group">
                      <label htmlFor="occurrenceDate">
                        <Calendar size={16} />
                        <span>Data da Ocorrência</span>
                      </label>
                      <input
                        type="date"
                        id="occurrenceDate"
                        name="occurrenceDate"
                        value={novoCaso.occurrenceDate}
                        onChange={handleCasoChange}
                      />
                    </div>
                    {/* Status */}
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={novoCaso.status} onChange={handleCasoChange}>
                        <option value="em andamento">Em Andamento</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="arquivado">Arquivado</option>
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
                      <button type="button" className="btn-cancelar" style={{background: '#000', color: '#fff', border: 'none'}} onClick={fecharModalNovo} disabled={criandoCaso}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-salvar" style={{background: '#000', color: '#fff', border: 'none'}} disabled={criandoCaso}>
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
                )}
                {abaAtiva === 'vitima' && adicionarVitima && (
                  <div style={{ padding: 0 }}>
                    <ModalAdicionarVitima
                      onFechar={fecharModalNovo}
                      onSalvar={handleSubmitVitima}
                      salvando={salvandoVitima}
                      erro={msgVitima}
                      inline={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ControleDeRota>
  )
}
