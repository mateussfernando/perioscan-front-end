"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import AsideNavbar from "@/components/AsideNavBar"
import "../../styles/caso-detalhes.css"
import { X, File, ImageIcon, Upload, Plus, Camera, FileText, Loader, Save, MapPin } from "lucide-react"

export default function CasoDetalhes() {
  const router = useRouter()
  const params = useParams()
  const [caso, setCaso] = useState(null)
  const [evidencias, setEvidencias] = useState([])
  const [loadingCaso, setLoadingCaso] = useState(true)
  const [loadingEvidencias, setLoadingEvidencias] = useState(true)
  const [error, setError] = useState(null)
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  // Estados para o modal de adicionar evidência
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false)
  const [tipoEvidencia, setTipoEvidencia] = useState("image") // "image" ou "text"
  const [descricaoEvidencia, setDescricaoEvidencia] = useState("")
  const [conteudoTexto, setConteudoTexto] = useState("")
  const [imagemSelecionada, setImagemSelecionada] = useState(null)
  const [previewImagem, setPreviewImagem] = useState(null)
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false)
  const [erroUpload, setErroUpload] = useState(null)
  const [tipoImagem, setTipoImagem] = useState("radiografia") // Novo campo para imageType

  // Estados para o modal de edição de caso
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [casoEditado, setCasoEditado] = useState({
    title: "",
    description: "",
    location: "",
    status: "",
    observation: "",
  })
  const [salvandoCaso, setSalvandoCaso] = useState(false)
  const [erroEdicao, setErroEdicao] = useState(null)

  // Ref para o input de arquivo
  const fileInputRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const id = params?.id

    if (!token) {
      router.push("/")
      return
    }

    if (!id) {
      setError("ID do caso não encontrado")
      setLoadingCaso(false)
      return
    }

    // Função para buscar os detalhes do caso
    async function fetchCasoDetalhes() {
      try {
        setLoadingCaso(true)
        console.log(`Buscando detalhes do caso ${id}...`)

        const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`)
        }

        const textData = await response.text()
        const responseObject = textData ? JSON.parse(textData) : {}

        if (responseObject.success && responseObject.data) {
          setCaso(responseObject.data)
          // Inicializar o estado de edição com os dados atuais do caso
          setCasoEditado({
            title: responseObject.data.title || "",
            description: responseObject.data.description || "",
            location: responseObject.data.location || "",
            status: responseObject.data.status || "Em Andamento",
            observation: responseObject.data.observation || "",
          })
        } else {
          console.error("Formato de resposta inesperado:", responseObject)
          setError("Formato de resposta inesperado")
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do caso:", error)
        setError(`Falha ao carregar detalhes do caso: ${error.message}`)
      } finally {
        setLoadingCaso(false)
      }
    }

    // Função para buscar as evidências do caso
    async function fetchEvidencias() {
      try {
        setLoadingEvidencias(true)
        console.log(`Buscando evidências do caso ${id}...`)

        const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}/evidence`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`)
        }

        const textData = await response.text()
        const responseObject = textData ? JSON.parse(textData) : {}

        if (responseObject.success && responseObject.data) {
          setEvidencias(responseObject.data)
        } else {
          console.error("Formato de resposta inesperado para evidências:", responseObject)
          // Não bloqueia o carregamento do caso se as evidências falham
        }
      } catch (error) {
        console.error("Erro ao buscar evidências do caso:", error)
        // Não bloqueia o carregamento do caso se as evidências falham
      } finally {
        setLoadingEvidencias(false)
      }
    }

    // Executa ambas as requisições
    fetchCasoDetalhes()
    fetchEvidencias()
  }, [params, router])

  const formatarData = (dataISO) => {
    if (!dataISO) return "--"
    const data = new Date(dataISO)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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

  // Função para abrir o modal de visualização de evidência
  const abrirEvidencia = (evidencia) => {
    setEvidenciaAtiva(evidencia)
    setModalAberto(true)
  }

  // Função para fechar o modal
  const fecharModal = () => {
    setModalAberto(false)
    setEvidenciaAtiva(null)
  }

  // Função para abrir o modal de adicionar evidência
  const abrirModalAdicionar = () => {
    // Resetar os estados do formulário
    setTipoEvidencia("image")
    setDescricaoEvidencia("")
    setConteudoTexto("")
    setImagemSelecionada(null)
    setPreviewImagem(null)
    setErroUpload(null)
    setTipoImagem("radiografia") // Resetar o tipo de imagem

    setModalAdicionarAberto(true)
  }

  // Função para fechar o modal de adicionar evidência
  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false)
  }

  // Função para abrir o modal de edição de caso
  const abrirModalEditar = () => {
    // Resetar o erro de edição
    setErroEdicao(null)
    setModalEditarAberto(true)
  }

  // Função para fechar o modal de edição de caso
  const fecharModalEditar = () => {
    setModalEditarAberto(false)
  }

  // Função para lidar com mudanças nos campos do formulário de edição
  const handleCasoChange = (e) => {
    const { name, value } = e.target
    setCasoEditado((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Função para salvar as alterações do caso
  const salvarCaso = async (e) => {
    e.preventDefault()
    setSalvandoCaso(true)
    setErroEdicao(null)

    try {
      const token = localStorage.getItem("token")
      const casoId = caso._id || caso.id

      console.log("Enviando dados atualizados do caso:", casoEditado)

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(casoEditado),
      })

      // Capturar a resposta completa para debug
      const responseText = await response.text()
      console.log("Resposta bruta da atualização do caso:", responseText)

      if (!response.ok) {
        console.error("Resposta de erro ao atualizar caso:", responseText)
        throw new Error(`Falha ao atualizar caso: ${response.status} ${response.statusText}`)
      }

      // Tentar analisar a resposta como JSON
      let casoAtualizado
      try {
        casoAtualizado = JSON.parse(responseText)
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da atualização do caso:", e)
        // Continuar mesmo com erro de parsing
      }

      console.log("Caso atualizado com sucesso:", casoAtualizado)

      // Atualizar o estado do caso com os novos dados
      if (casoAtualizado && casoAtualizado.data) {
        setCaso(casoAtualizado.data)
      } else {
        // Se não conseguirmos obter os dados atualizados da resposta, recarregamos a página
        window.location.reload()
      }

      // Fechar o modal
      fecharModalEditar()
    } catch (error) {
      console.error("Erro ao atualizar caso:", error)
      setErroEdicao(`Falha ao atualizar caso: ${error.message}`)
    } finally {
      setSalvandoCaso(false)
    }
  }

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Verificar o tamanho do arquivo (50MB = 50 * 1024 * 1024 bytes)
    if (file.size > 50 * 1024 * 1024) {
      setErroUpload("O arquivo é muito grande. O tamanho máximo permitido é 50MB.")
      return
    }

    setImagemSelecionada(file)

    // Criar preview da imagem
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImagem(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Função para enviar a evidência
  const enviarEvidencia = async (e) => {
    e.preventDefault()

    if (tipoEvidencia === "image" && !imagemSelecionada) {
      setErroUpload("Por favor, selecione uma imagem para upload.")
      return
    }

    if (tipoEvidencia === "text" && !conteudoTexto) {
      setErroUpload("Por favor, insira o conteúdo do texto.")
      return
    }

    if (!descricaoEvidencia) {
      setErroUpload("Por favor, insira uma descrição para a evidência.")
      return
    }

    setEnviandoEvidencia(true)
    setErroUpload(null)

    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")
      const casoId = caso._id || caso.id

      // Para evidências do tipo imagem, primeiro fazemos upload da imagem
      let imageUrl = null
      let uploadData = null
      if (tipoEvidencia === "image" && imagemSelecionada) {
        const formData = new FormData()
        // Usar o nome de campo correto 'image' em vez de 'file'
        formData.append("image", imagemSelecionada)
        // Adicionar o tipo de evidência como parâmetro opcional
        formData.append("evidenceType", "caso")
        // Adicionar o ID do caso
        formData.append("case", casoId)

        console.log("Enviando imagem para upload...")

        const uploadResponse = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Não incluir Content-Type aqui, o navegador vai definir automaticamente com o boundary correto
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("Resposta de erro do upload:", errorText)
          throw new Error(`Falha ao fazer upload da imagem: ${uploadResponse.status} ${uploadResponse.statusText}`)
        }

        // Obter a resposta completa como texto primeiro para debug
        const responseText = await uploadResponse.text()
        console.log("Resposta bruta do upload:", responseText)

        // Tentar analisar a resposta como JSON
        try {
          uploadData = JSON.parse(responseText)
        } catch (e) {
          console.error("Erro ao analisar resposta JSON:", e)
          throw new Error("A resposta da API não é um JSON válido")
        }

        console.log("Resposta do upload (objeto):", uploadData)

        // Tentar encontrar a URL da imagem em diferentes propriedades possíveis
        if (uploadData.data && uploadData.data.url) {
          imageUrl = uploadData.data.url
          console.log("URL encontrada em data.url:", imageUrl)
        } else if (uploadData.url) {
          imageUrl = uploadData.url
          console.log("URL encontrada em url:", imageUrl)
        } else if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl
          console.log("URL encontrada em imageUrl:", imageUrl)
        } else if (uploadData.data && uploadData.data.imageUrl) {
          imageUrl = uploadData.data.imageUrl
          console.log("URL encontrada em data.imageUrl:", imageUrl)
        } else if (uploadData.secure_url) {
          imageUrl = uploadData.secure_url
          console.log("URL encontrada em secure_url:", imageUrl)
        } else if (uploadData.data && uploadData.data.secure_url) {
          imageUrl = uploadData.data.secure_url
          console.log("URL encontrada em data.secure_url:", imageUrl)
        } else {
          console.error("Não foi possível encontrar a URL da imagem na resposta:", uploadData)
          throw new Error("A API de upload não retornou uma URL de imagem válida")
        }

        // Verificar se a URL é válida
        try {
          new URL(imageUrl)
          console.log("URL da imagem extraída e validada:", imageUrl)
        } catch (e) {
          console.error("URL da imagem inválida:", imageUrl)
          throw new Error("A URL da imagem retornada pelo Cloudinary é inválida")
        }
      }

      // Agora criamos a evidência com todos os campos necessários
      const evidenciaData = {
        type: tipoEvidencia,
        case: casoId,
        description: descricaoEvidencia,
        content: tipoEvidencia === "text" ? conteudoTexto : "",
        // Campos adicionais baseados no exemplo fornecido
        evidenceType: tipoEvidencia === "image" ? "ImageEvidence" : "TextEvidence",
        annotations: [],
        collectedBy: userId, // ID do usuário logado
      }

      // Adicionar campos específicos para evidências de imagem
      if (tipoEvidencia === "image" && imageUrl) {
        // Extrair o public_id da resposta do Cloudinary
        let publicId = null
        if (uploadData.data && uploadData.data.public_id) {
          publicId = uploadData.data.public_id
        } else if (uploadData.public_id) {
          publicId = uploadData.public_id
        }

        // Garantir que a URL da imagem seja passada exatamente como recebida do Cloudinary
        evidenciaData.imageUrl = imageUrl
        evidenciaData.imageType = tipoImagem

        // Adicionar o objeto cloudinary que o backend espera
        evidenciaData.cloudinary = {
          url: imageUrl,
          public_id: publicId,
        }

        // Log para debug
        console.log("URL da imagem sendo enviada:", imageUrl)
        console.log("Public ID extraído:", publicId)
        console.log("Dados completos da evidência:", JSON.stringify(evidenciaData, null, 2))
      }

      // Verificar se temos uma URL de imagem para evidências do tipo imagem
      if (tipoEvidencia === "image" && !imageUrl) {
        setErroUpload("Falha ao obter URL da imagem do Cloudinary. Tente novamente.")
        setEnviandoEvidencia(false)
        return
      }

      console.log("Criando evidência:", evidenciaData)

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/evidence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evidenciaData),
      })

      // Capturar a resposta completa para debug
      const responseText = await response.text()
      console.log("Resposta bruta da criação de evidência:", responseText)

      if (!response.ok) {
        console.error("Resposta de erro ao criar evidência:", responseText)
        throw new Error(`Falha ao criar evidência: ${response.status} ${response.statusText}`)
      }

      // Tentar analisar a resposta como JSON
      let novaEvidencia
      try {
        novaEvidencia = JSON.parse(responseText)
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação de evidência:", e)
        // Continuar mesmo com erro de parsing
      }

      console.log("Evidência criada com sucesso:", novaEvidencia)

      if (novaEvidencia && novaEvidencia.data) {
        setEvidencias([...evidencias, novaEvidencia.data])
      }

      // Fechar o modal
      fecharModalAdicionar()

      // Recarregar as evidências para garantir que temos os dados mais recentes
      const id = params?.id
      const evidenciasResponse = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}/evidence`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (evidenciasResponse.ok) {
        const evidenciasData = await evidenciasResponse.json()
        if (evidenciasData.success && evidenciasData.data) {
          setEvidencias(evidenciasData.data)
        }
      }
    } catch (error) {
      console.error("Erro ao enviar evidência:", error)
      setErroUpload(`Falha ao enviar evidência: ${error.message}`)
    } finally {
      setEnviandoEvidencia(false)
    }
  }

  // Função para renderizar o conteúdo do modal baseado no tipo de evidência
  const renderizarConteudoEvidencia = () => {
    if (!evidenciaAtiva) return null

    if (evidenciaAtiva.type === "image") {
      return (
        <div className="evidencia-imagem-container">
          <img
            src={evidenciaAtiva.imageUrl || "/placeholder.svg"}
            alt={evidenciaAtiva.description || "Imagem da evidência"}
            className="evidencia-imagem"
          />
          {evidenciaAtiva.description && <p className="evidencia-descricao">{evidenciaAtiva.description}</p>}
        </div>
      )
    } else {
      // Tipo texto ou outro
      return (
        <div className="evidencia-texto-container">
          <h3>{evidenciaAtiva.description || "Evidência de texto"}</h3>
          <div className="evidencia-texto-content">{evidenciaAtiva.content}</div>
          <p className="evidencia-info">
            <strong>Coletado em:</strong> {formatarData(evidenciaAtiva.collectionDate)}
            {evidenciaAtiva.collectedBy && (
              <span>
                {" "}
                por <strong>{evidenciaAtiva.collectedBy}</strong>
              </span>
            )}
          </p>
        </div>
      )
    }
  }

  return (
    <div className="main-container-caso-detalhes">
      <AsideNavbar />

      <div className="container-caso-detalhes">
        {loadingCaso ? (
          <div className="loading-container">
            <p>Carregando detalhes do caso...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => router.push("/casos")} className="voltar-button">
              Voltar para lista de casos
            </button>
          </div>
        ) : caso ? (
          <div className="caso-card">
            <div className="caso-card-header">
              <h1>
                {caso.caseNumber || "CASO-1023"} - {caso.title || "Identificação em Incêndio"}
              </h1>
              <div className="header-actions">
                <button className="btn-editar" onClick={abrirModalEditar}>
                  Editar Caso
                </button>
                <button className="btn-voltar" onClick={() => router.push("/casos")}>
                  Voltar
                </button>
              </div>
            </div>

            <div className="caso-content">
              <div className="info-coluna">
                <div className="info-section">
                  <h2>Informações Gerais</h2>
                  <div className="info-item">
                    <strong>ID do Caso:</strong> {caso._id || caso.id || "ID não disponível"}
                  </div>
                  <div className="info-item">
                    <strong>Título:</strong> {caso.title || "Identificação de Vítima em Incêndio Residencial"}
                  </div>
                  <div className="info-item">
                    <strong>Data da Ocorrência:</strong> {formatarData(caso.openDate) || "15-02-2025"}
                  </div>
                  <div className="info-item">
                    <strong>Local:</strong> {caso.location || "Belo Horizonte, MG"}
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClassName(caso.status)}>{caso.status || "Em Andamento"}</span>
                  </div>
                  <div className="info-item">
                    <strong>Criado por:</strong> {caso.createdBy?.name || "Não informado"}
                  </div>
                </div>

                <div className="evidencias-section">
                  <h2>Evidências</h2>
                  {loadingEvidencias ? (
                    <div className="loading-evidencias">Carregando evidências...</div>
                  ) : (
                    <>
                      <div className="evidencias-tabela">
                        <table>
                          <thead>
                            <tr>
                              <th>Nome/Descrição</th>
                              <th>Tipo</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {evidencias.length > 0 ? (
                              evidencias.map((evidencia, index) => (
                                <tr
                                  key={evidencia.id || evidencia._id || index}
                                  className="evidencia-row"
                                  onClick={() => abrirEvidencia(evidencia)}
                                >
                                  <td>{evidencia.description || `Evidência ${index + 1}`}</td>
                                  <td>{evidencia.type === "image" ? "Imagem" : "Texto"}</td>
                                  <td className="icon-cell">
                                    {evidencia.type === "image" ? <ImageIcon size={18} /> : <File size={18} />}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="no-evidencias">
                                  Nenhuma evidência registrada
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button className="btn-adicionar" onClick={abrirModalAdicionar}>
                        Adicionar Evidência
                      </button>
                    </>
                  )}
                </div>

                <div className="observacao-section">
                  <h2>Observação</h2>
                  <div className="observacao-box">
                    <p>{caso.observation || '"Perito deve atualizar sua lista de documentos até o dia 20/02/25"'}</p>
                  </div>
                </div>
              </div>

              <div className="descricao-coluna">
                <h2>Descrição do Caso</h2>
                <div className="descricao-content">
                  <p>
                    {caso.description ||
                      `No dia 15 de fevereiro de 2024, um incêndio destruiu uma residência no bairro Santa Efigênia, na zona leste da zona. Durante a perícia, foram encontrados restos mortais carbonizados, impossibilitando a identificação visual da vítima. A polícia solicitou exames odontológicos para comparação de registros dentários e tentativa de identificação da vítima.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="not-found-container">
            <p>Caso não encontrado</p>
            <button onClick={() => router.push("/casos")} className="voltar-button">
              Voltar para lista de casos
            </button>
          </div>
        )}

        {/* Modal para visualizar evidências */}
        {modalAberto && evidenciaAtiva && (
          <div className="evidencia-modal-overlay" onClick={fecharModal}>
            <div className="evidencia-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="evidencia-modal-header">
                <h3>{evidenciaAtiva.type === "image" ? "Visualizar Imagem" : "Visualizar Texto"}</h3>
                <button className="btn-fechar-modal" onClick={fecharModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="evidencia-modal-body">{renderizarConteudoEvidencia()}</div>
            </div>
          </div>
        )}

        {/* Modal para adicionar evidência */}
        {modalAdicionarAberto && (
          <div className="evidencia-modal-overlay" onClick={fecharModalAdicionar}>
            <div className="evidencia-modal-content modal-adicionar" onClick={(e) => e.stopPropagation()}>
              <div className="evidencia-modal-header">
                <h3>Adicionar Nova Evidência</h3>
                <button className="btn-fechar-modal" onClick={fecharModalAdicionar}>
                  <X size={20} />
                </button>
              </div>

              <div className="evidencia-modal-body">
                <form onSubmit={enviarEvidencia} className="form-adicionar-evidencia">
                  {/* Seleção de tipo de evidência */}
                  <div className="tipo-evidencia-selector">
                    <button
                      type="button"
                      className={`tipo-btn ${tipoEvidencia === "image" ? "active" : ""}`}
                      onClick={() => setTipoEvidencia("image")}
                    >
                      <Camera size={20} />
                      <span>Imagem</span>
                    </button>
                    <button
                      type="button"
                      className={`tipo-btn ${tipoEvidencia === "text" ? "active" : ""}`}
                      onClick={() => setTipoEvidencia("text")}
                    >
                      <FileText size={20} />
                      <span>Texto</span>
                    </button>
                  </div>

                  {/* Campo de descrição (comum para ambos os tipos) */}
                  <div className="form-group">
                    <label htmlFor="descricao">Descrição da Evidência</label>
                    <input
                      type="text"
                      id="descricao"
                      value={descricaoEvidencia}
                      onChange={(e) => setDescricaoEvidencia(e.target.value)}
                      placeholder="Ex: Radiografia panorâmica da vítima"
                      required
                    />
                  </div>

                  {/* Campos específicos para cada tipo de evidência */}
                  {tipoEvidencia === "image" ? (
                    <>
                      {/* Tipo de imagem (novo campo) */}
                      <div className="form-group">
                        <label htmlFor="tipoImagem">Tipo de Imagem</label>
                        <select
                          id="tipoImagem"
                          value={tipoImagem}
                          onChange={(e) => setTipoImagem(e.target.value)}
                          required
                        >
                          <option value="radiografia">Radiografia</option>
                          <option value="fotografia">Fotografia</option>
                          <option value="tomografia">Tomografia</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>

                      {/* Área de upload */}
                      <div className="form-group upload-container">
                        <label>Imagem (máx. 50MB)</label>
                        <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                          {previewImagem ? (
                            <div className="preview-container">
                              <img src={previewImagem || "/placeholder.svg"} alt="Preview" className="image-preview" />
                              <button
                                type="button"
                                className="remove-preview"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setImagemSelecionada(null)
                                  setPreviewImagem(null)
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload size={40} />
                              <p>Clique para selecionar ou arraste uma imagem</p>
                              <span className="upload-hint">JPG, PNG ou GIF até 50MB</span>
                            </>
                          )}

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: "none" }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label htmlFor="conteudo">Conteúdo do Texto</label>
                      <textarea
                        id="conteudo"
                        value={conteudoTexto}
                        onChange={(e) => setConteudoTexto(e.target.value)}
                        placeholder="Insira o conteúdo textual da evidência aqui..."
                        rows={6}
                        required
                      ></textarea>
                    </div>
                  )}

                  {/* Mensagem de erro */}
                  {erroUpload && (
                    <div className="upload-error">
                      <p>{erroUpload}</p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={fecharModalAdicionar}
                      disabled={enviandoEvidencia}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-salvar" disabled={enviandoEvidencia}>
                      {enviandoEvidencia ? (
                        <>
                          <Loader size={16} className="spinner" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Adicionar Evidência</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar caso */}
        {modalEditarAberto && (
          <div className="evidencia-modal-overlay" onClick={fecharModalEditar}>
            <div className="evidencia-modal-content modal-editar" onClick={(e) => e.stopPropagation()}>
              <div className="evidencia-modal-header">
                <h3>Editar Caso</h3>
                <button className="btn-fechar-modal" onClick={fecharModalEditar}>
                  <X size={20} />
                </button>
              </div>

              <div className="evidencia-modal-body">
                <form onSubmit={salvarCaso} className="form-editar-caso">
                  {/* Título do caso */}
                  <div className="form-group">
                    <label htmlFor="title">
                      <span>Título do Caso</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={casoEditado.title}
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
                      value={casoEditado.location}
                      onChange={handleCasoChange}
                      placeholder="Ex: Belo Horizonte, MG"
                    />
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={casoEditado.status} onChange={handleCasoChange} required>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Pendente">Pendente</option>
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
                      value={casoEditado.description}
                      onChange={handleCasoChange}
                      placeholder="Descreva os detalhes do caso..."
                      rows={6}
                    ></textarea>
                  </div>

                  {/* Observação */}
                  <div className="form-group">
                    <label htmlFor="observation">Observação</label>
                    <textarea
                      id="observation"
                      name="observation"
                      value={casoEditado.observation}
                      onChange={handleCasoChange}
                      placeholder="Adicione observações relevantes..."
                      rows={3}
                    ></textarea>
                  </div>

                  {/* Mensagem de erro */}
                  {erroEdicao && (
                    <div className="upload-error">
                      <p>{erroEdicao}</p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="form-actions">
                    <button type="button" className="btn-cancelar" onClick={fecharModalEditar} disabled={salvandoCaso}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-salvar" disabled={salvandoCaso}>
                      {salvandoCaso ? (
                        <>
                          <Loader size={16} className="spinner" />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Salvar Alterações</span>
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
    </div>
  )
}
