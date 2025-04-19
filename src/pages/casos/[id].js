"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import AsideNavbar from "@/components/AsideNavBar"
import "../../styles/caso-detalhes.css"
import {
  X,
  Upload,
  Plus,
  Camera,
  FileText,
  Loader,
  Save,
  MapPin,
  Trash2,
  Pencil,
  FileDown,
  AlertCircle,
  Eye,
  ClipboardList,
} from "lucide-react"

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
  const [gerandoLaudo, setGerandoLaudo] = useState({})
  const [baixandoPDF, setBaixandoPDF] = useState({})
  const [laudosEvidencias, setLaudosEvidencias] = useState({}) // Mapeia evidência ID -> laudo ID

  // Estados para o modal de criar laudo
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false)
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null)
  const [dadosLaudo, setDadosLaudo] = useState({
    titulo: "",
    conteudo: "",
    achados: "",
    metodologia: "",
  })
  const [criandoLaudo, setCriandoLaudo] = useState(false)
  const [erroLaudo, setErroLaudo] = useState(null)

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

  // Estados para o modal de exclusão de caso
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [excluindoCaso, setExcluindoCaso] = useState(false)
  const [erroExclusao, setErroExclusao] = useState(null)
  const [userRole, setUserRole] = useState("")

  // Estado para notificações de laudo
  const [notificacaoLaudo, setNotificacaoLaudo] = useState({ visible: false, message: "", type: "" })

  // Ref para o input de arquivo
  const fileInputRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const id = params?.id

    setUserRole(role || "")

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

          // Buscar laudos existentes para cada evidência
          const evidenciasIds = responseObject.data.map((ev) => ev._id || ev.id)
          if (evidenciasIds.length > 0) {
            fetchLaudosExistentes(evidenciasIds)
          }
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

    // Função para buscar laudos existentes para as evidências
    async function fetchLaudosExistentes(evidenciasIds) {
      try {
        const token = localStorage.getItem("token")

        // Buscar todos os laudos
        const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error("Erro ao buscar laudos existentes:", response.status)
          return
        }

        const data = await response.json()
        if (data.success && data.data) {
          // Mapear evidências para seus laudos
          const laudosMap = {}
          data.data.forEach((laudo) => {
            if (evidenciasIds.includes(laudo.evidence)) {
              laudosMap[laudo.evidence] = laudo._id || laudo.id
            }
          })

          setLaudosEvidencias(laudosMap)
          console.log("Laudos existentes:", laudosMap)
        }
      } catch (error) {
        console.error("Erro ao buscar laudos existentes:", error)
      }
    }

    // Executa ambas as requisições
    fetchCasoDetalhes()
    fetchEvidencias()
  }, [params, router])

  // Função para abrir o modal de criar laudo
  const abrirModalCriarLaudo = (evidencia) => {
    setEvidenciaParaLaudo(evidencia)

    // Pré-preencher alguns campos com base no tipo de evidência
    let metodologiaSugerida = ""
    if (evidencia.type === "image") {
      metodologiaSugerida =
        evidencia.imageType === "radiografia"
          ? "Análise radiográfica digital com contraste"
          : "Análise de imagem digital"
    } else {
      metodologiaSugerida = "Análise documental"
    }

    setDadosLaudo({
      titulo: `Laudo de ${evidencia.type === "image" ? "Imagem" : "Texto"}: ${evidencia.description || ""}`,
      conteudo: "",
      achados: "",
      metodologia: metodologiaSugerida,
    })

    setErroLaudo(null)
    setModalCriarLaudoAberto(true)
  }

  // Função para fechar o modal de criar laudo
  const fecharModalCriarLaudo = () => {
    setModalCriarLaudoAberto(false)
    setEvidenciaParaLaudo(null)
  }

  // Função para lidar com mudanças nos campos do formulário de laudo
  const handleLaudoChange = (e) => {
    const { name, value } = e.target
    setDadosLaudo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Função para criar o laudo da evidência
  const criarLaudo = async (e) => {
    e.preventDefault()

    if (!evidenciaParaLaudo) {
      setErroLaudo("Evidência não selecionada")
      return
    }

    setCriandoLaudo(true)
    setErroLaudo(null)

    try {
      const token = localStorage.getItem("token")
      const evidenciaId = evidenciaParaLaudo._id || evidenciaParaLaudo.id

      console.log(`Criando laudo para evidência ${evidenciaId}...`)

      // Preparar dados para enviar ao backend
      const laudoData = {
        title: dadosLaudo.titulo,
        content: dadosLaudo.conteudo,
        evidence: evidenciaId,
        findings: dadosLaudo.achados,
        methodology: dadosLaudo.metodologia,
      }

      console.log("Dados do laudo:", laudoData)

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(laudoData),
      })

      // Capturar a resposta completa para debug
      const responseText = await response.text()
      console.log("Resposta bruta da criação de laudo:", responseText)

      if (!response.ok) {
        console.error("Resposta de erro ao criar laudo:", responseText)
        throw new Error(`Falha ao criar laudo: ${response.status} ${response.statusText}`)
      }

      // Tentar analisar a resposta como JSON
      let novoLaudo
      try {
        novoLaudo = JSON.parse(responseText)
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação de laudo:", e)
        // Continuar mesmo com erro de parsing
      }

      console.log("Laudo criado com sucesso:", novoLaudo)

      // Atualizar o mapeamento de laudos
      if (novoLaudo && (novoLaudo.data || novoLaudo)) {
        const laudoData = novoLaudo.data || novoLaudo
        const laudoId = laudoData._id || laudoData.id

        setLaudosEvidencias((prev) => ({
          ...prev,
          [evidenciaId]: laudoId,
        }))

        // Mostrar notificação de sucesso
        setNotificacaoLaudo({
          visible: true,
          message: "Laudo criado com sucesso!",
          type: "success",
        })
      }

      // Fechar o modal
      fecharModalCriarLaudo()
    } catch (error) {
      console.error("Erro ao criar laudo:", error)
      setErroLaudo(`Falha ao criar laudo: ${error.message}`)
    } finally {
      setCriandoLaudo(false)

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }))
      }, 5000)
    }
  }

  // Função para baixar o PDF do laudo
  const baixarPDF = async (evidenciaId, laudoId) => {
    // Atualizar estado para mostrar o loader para este laudo específico
    setBaixandoPDF((prev) => ({ ...prev, [laudoId]: true }))

    try {
      const token = localStorage.getItem("token")

      console.log(`Baixando PDF do laudo ${laudoId} para evidência ${evidenciaId}...`)

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports/${laudoId}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Tentar obter mais informações sobre o erro
        let errorMessage = `Erro ${response.status}`
        try {
          const errorData = await response.text()
          console.error("Resposta de erro completa:", errorData)
          errorMessage += `: ${errorData}`
        } catch (e) {
          // Se não conseguir ler o corpo da resposta, use a mensagem padrão
        }

        throw new Error(`Erro ao baixar PDF: ${errorMessage}`)
      }

      // Verificar o tipo de conteúdo da resposta
      const contentType = response.headers.get("content-type")
      console.log("Tipo de conteúdo da resposta:", contentType)

      if (contentType && contentType.includes("application/pdf")) {
        // É um PDF, vamos fazer o download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `laudo-evidencia-${evidenciaId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Mostrar notificação de sucesso
        setNotificacaoLaudo({
          visible: true,
          message: "PDF baixado com sucesso!",
          type: "success",
        })
      } else {
        // Não é um PDF, pode ser uma resposta JSON com erro
        const data = await response.text()
        console.error("Resposta não é um PDF:", data)
        throw new Error("O servidor não retornou um PDF. Verifique os logs para mais detalhes.")
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      setNotificacaoLaudo({
        visible: true,
        message: `${error.message}`,
        type: "error",
      })
    } finally {
      // Remover o estado de loading para este laudo
      setBaixandoPDF((prev) => {
        const newState = { ...prev }
        delete newState[laudoId]
        return newState
      })

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }))
      }, 5000)
    }
  }

  // Verifica se o usuário tem permissão para excluir casos
  const podeExcluirCaso = () => {
    return userRole === "admin" || (userRole === "perito" && caso?.createdBy?.id === localStorage.getItem("userId"))
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

  // Função para abrir o modal de exclusão de caso
  const abrirModalExcluir = () => {
    if (!podeExcluirCaso()) {
      alert("Você não tem permissão para excluir este caso.")
      return
    }

    setErroExclusao(null)
    setModalExcluirAberto(true)
  }

  // Função para fechar o modal de exclusão de caso
  const fecharModalExcluir = () => {
    setModalExcluirAberto(false)
  }

  // Substituir a função arquivarCaso pela função excluirCaso original
  // Função para excluir o caso
  const excluirCaso = async () => {
    setExcluindoCaso(true)
    setErroExclusao(null)

    try {
      const token = localStorage.getItem("token")
      const casoId = caso._id || caso.id

      console.log(`Excluindo caso ${casoId}...`)

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Capturar a resposta completa para debug
      const responseText = await response.text()
      console.log("Resposta bruta da exclusão do caso:", responseText)

      if (!response.ok) {
        console.error("Resposta de erro ao excluir caso:", responseText)
        throw new Error(`Falha ao excluir caso: ${response.status} ${response.statusText}`)
      }

      console.log("Caso excluído com sucesso")

      // Redirecionar para a lista de casos
      router.push("/casos")
    } catch (error) {
      console.error("Erro ao excluir caso:", error)
      setErroExclusao(`Falha ao excluir caso: ${error.message}`)
    } finally {
      setExcluindoCaso(false)
    }
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
        {/* Notificação de laudo */}
        {notificacaoLaudo.visible && (
          <div className={`notificacao-laudo ${notificacaoLaudo.type}`}>
            {notificacaoLaudo.type === "error" ? <AlertCircle size={18} /> : <FileDown size={18} />}
            <span>{notificacaoLaudo.message}</span>
            <button
              className="fechar-notificacao"
              onClick={() => setNotificacaoLaudo((prev) => ({ ...prev, visible: false }))}
            >
              <X size={16} />
            </button>
          </div>
        )}

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
                  <Pencil size={16} />
                  Editar Caso
                </button>
                <button className="btn-excluir" onClick={abrirModalExcluir} disabled={!podeExcluirCaso()}>
                  <Trash2 size={16} />
                  Excluir
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
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evidencias.length > 0 ? (
                              evidencias.map((evidencia, index) => {
                                const evidenciaId = evidencia._id || evidencia.id
                                const temLaudo = !!laudosEvidencias[evidenciaId]

                                return (
                                  <tr key={evidenciaId || index} className="evidencia-row">
                                    <td onClick={() => abrirEvidencia(evidencia)}>
                                      {evidencia.description || `Evidência ${index + 1}`}
                                    </td>
                                    <td onClick={() => abrirEvidencia(evidencia)}>
                                      {evidencia.type === "image" ? "Imagem" : "Texto"}
                                    </td>
                                    <td className="acoes-cell">
                                      <button
                                        className="btn-ver-caso"
                                        onClick={() => abrirEvidencia(evidencia)}
                                        title="Ver detalhes"
                                      >
                                        <Eye size={18} />
                                      </button>

                                      {temLaudo ? (
                                        <button
                                          className="btn-baixar-pdf"
                                          onClick={() => baixarPDF(evidenciaId, laudosEvidencias[evidenciaId])}
                                          disabled={baixandoPDF[laudosEvidencias[evidenciaId]]}
                                          title="Baixar PDF do laudo"
                                        >
                                          {baixandoPDF[laudosEvidencias[evidenciaId]] ? (
                                            <Loader size={18} className="spinner" />
                                          ) : (
                                            <FileDown size={18} />
                                          )}
                                        </button>
                                      ) : (
                                        <button
                                          className="btn-criar-laudo"
                                          onClick={() => abrirModalCriarLaudo(evidencia)}
                                          disabled={gerandoLaudo[evidenciaId]}
                                          title="Criar laudo"
                                        >
                                          {gerandoLaudo[evidenciaId] ? (
                                            <Loader size={18} className="spinner" />
                                          ) : (
                                            <ClipboardList size={18} />
                                          )}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })
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
              <div className="evidencia-modal-footer">
                {laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id] ? (
                  <button
                    className="btn-baixar-pdf-modal"
                    onClick={() =>
                      baixarPDF(
                        evidenciaAtiva._id || evidenciaAtiva.id,
                        laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id],
                      )
                    }
                    disabled={baixandoPDF[laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]]}
                  >
                    {baixandoPDF[laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]] ? (
                      <>
                        <Loader size={16} className="spinner" />
                        <span>Baixando PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown size={16} />
                        <span>Baixar PDF do Laudo</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="btn-criar-laudo-modal"
                    onClick={() => abrirModalCriarLaudo(evidenciaAtiva)}
                    disabled={gerandoLaudo[evidenciaAtiva._id || evidenciaAtiva.id]}
                  >
                    {gerandoLaudo[evidenciaAtiva._id || evidenciaAtiva.id] ? (
                      <>
                        <Loader size={16} className="spinner" />
                        <span>Criando laudo...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList size={16} />
                        <span>Criar Laudo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para criar laudo */}
        {modalCriarLaudoAberto && evidenciaParaLaudo && (
          <div className="evidencia-modal-overlay" onClick={fecharModalCriarLaudo}>
            <div className="evidencia-modal-content modal-criar-laudo" onClick={(e) => e.stopPropagation()}>
              <div className="evidencia-modal-header">
                <h3>Criar Laudo para Evidência</h3>
                <button className="btn-fechar-modal" onClick={fecharModalCriarLaudo}>
                  <X size={20} />
                </button>
              </div>

              <div className="evidencia-modal-body">
                <form onSubmit={criarLaudo} className="form-criar-laudo">
                  {/* Título do laudo */}
                  <div className="form-group">
                    <label htmlFor="titulo">Título do Laudo</label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={dadosLaudo.titulo}
                      onChange={handleLaudoChange}
                      placeholder="Ex: Análise de Radiografia Mandibular"
                      required
                    />
                  </div>

                  {/* Conteúdo do laudo */}
                  <div className="form-group">
                    <label htmlFor="conteudo">Conteúdo do Laudo</label>
                    <textarea
                      id="conteudo"
                      name="conteudo"
                      value={dadosLaudo.conteudo}
                      onChange={handleLaudoChange}
                      placeholder="Descreva detalhadamente a análise da evidência..."
                      rows={5}
                      required
                    ></textarea>
                  </div>

                  {/* Achados */}
                  <div className="form-group">
                    <label htmlFor="achados">Achados</label>
                    <textarea
                      id="achados"
                      name="achados"
                      value={dadosLaudo.achados}
                      onChange={handleLaudoChange}
                      placeholder="Descreva os achados principais da análise..."
                      rows={3}
                      required
                    ></textarea>
                  </div>

                  {/* Metodologia */}
                  <div className="form-group">
                    <label htmlFor="metodologia">Metodologia</label>
                    <textarea
                      id="metodologia"
                      name="metodologia"
                      value={dadosLaudo.metodologia}
                      onChange={handleLaudoChange}
                      placeholder="Descreva a metodologia utilizada na análise..."
                      rows={2}
                      required
                    ></textarea>
                  </div>

                  {/* Mensagem de erro */}
                  {erroLaudo && (
                    <div className="upload-error">
                      <p>{erroLaudo}</p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={fecharModalCriarLaudo}
                      disabled={criandoLaudo}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-salvar" disabled={criandoLaudo}>
                      {criandoLaudo ? (
                        <>
                          <Loader size={16} className="spinner" />
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <ClipboardList size={16} />
                          <span>Criar Laudo</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
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

        {/* Modal para excluir caso */}
        {modalExcluirAberto && (
          <div className="evidencia-modal-overlay" onClick={fecharModalExcluir}>
            <div className="evidencia-modal-content modal-excluir" onClick={(e) => e.stopPropagation()}>
              <div className="evidencia-modal-header excluir-header">
                <h3>Excluir Caso</h3>
                <button className="btn-fechar-modal" onClick={fecharModalExcluir}>
                  <X size={20} />
                </button>
              </div>

              <div className="evidencia-modal-body">
                <div className="excluir-aviso">
                  <Trash2 size={48} className="excluir-icone" />
                  <p>
                    Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita e todas as evidências
                    associadas também serão excluídas.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {erroExclusao && (
                  <div className="upload-error">
                    <p>{erroExclusao}</p>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="form-actions">
                  <button type="button" className="btn-cancelar" onClick={fecharModalExcluir} disabled={excluindoCaso}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-excluir-confirmar"
                    onClick={excluirCaso}
                    disabled={excluindoCaso}
                  >
                    {excluindoCaso ? (
                      <>
                        <Loader size={16} className="spinner" />
                        <span>Excluindo...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>Confirmar Exclusão</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
