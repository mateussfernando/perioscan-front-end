"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import AsideNavbar from "@/components/AsideNavBar"
import "../../styles/caso-detalhes.css"
import { ArrowLeft, Calendar, MapPin, User, FileText, Clock, Tag, X, Image, File } from "lucide-react"
import Link from "next/link"

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
  
  // Função para renderizar o conteúdo do modal baseado no tipo de evidência
  const renderizarConteudoEvidencia = () => {
    if (!evidenciaAtiva) return null
    
    if (evidenciaAtiva.type === "image") {
      return (
        <div className="evidencia-imagem-container">
          <img 
            src={evidenciaAtiva.imageUrl} 
            alt={evidenciaAtiva.description || "Imagem da evidência"} 
            className="evidencia-imagem" 
          />
          {evidenciaAtiva.description && (
            <p className="evidencia-descricao">{evidenciaAtiva.description}</p>
          )}
        </div>
      )
    } else {
      // Tipo texto ou outro
      return (
        <div className="evidencia-texto-container">
          <h3>{evidenciaAtiva.description || "Evidência de texto"}</h3>
          <div className="evidencia-texto-content">
            {evidenciaAtiva.content}
          </div>
          <p className="evidencia-info">
            <strong>Coletado em:</strong> {formatarData(evidenciaAtiva.collectionDate)} 
            {evidenciaAtiva.collectedBy && (
              <span> por <strong>{evidenciaAtiva.collectedBy}</strong></span>
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
              <h1>{caso.caseNumber || "CASO-1023"} - {caso.title || "Identificação em Incêndio"}</h1>
              <div className="header-actions">
                <button className="btn-editar">Editar Caso</button>
                <button className="btn-voltar" onClick={() => router.push("/casos")}>Voltar</button>
              </div>
            </div>
            
            <div className="caso-content">
              <div className="info-coluna">
                <div className="info-section">
                  <h2>Informações Gerais</h2>
                  <div className="info-item">
                    <strong>ID do Caso:</strong> {caso.caseNumber || "CASO-1023"}
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
                    <strong>Status:</strong> <span className={getStatusClassName(caso.status)}>{caso.status || "Em Andamento"}</span>
                  </div>
                  <div className="info-item">
                    <strong>Perito Responsável:</strong> {caso.assignedTo?.name || "Pedro Victor"}
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
                                  key={evidencia.id || index} 
                                  className="evidencia-row"
                                  onClick={() => abrirEvidencia(evidencia)}
                                >
                                  <td>{evidencia.description || `Evidência ${index + 1}`}</td>
                                  <td>{evidencia.type === "image" ? "Imagem" : "Texto"}</td>
                                  <td className="icon-cell">
                                    {evidencia.type === "image" ? <Image size={18} /> : <File size={18} />}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="no-evidencias">Nenhuma evidência registrada</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button className="btn-adicionar">Adicionar Evidência</button>
                    </>
                  )}
                </div>
                
                <div className="observacao-section">
                  <h2>Observação</h2>
                  <div className="observacao-box">
                    <p>{caso.observation || "\"Perito deve atualizar sua lista de documentos até o dia 20/02/25\""}</p>
                  </div>
                </div>
              </div>
              
              <div className="descricao-coluna">
                <h2>Descrição do Caso</h2>
                <div className="descricao-content">
                  <p>
                    {caso.description || `No dia 15 de fevereiro de 2024, um incêndio destruiu uma residência no bairro Santa Efigênia, na zona leste da zona. Durante a perícia, foram encontrados restos mortais carbonizados, impossibilitando a identificação visual da vítima. A polícia solicitou exames odontológicos para comparação de registros dentários e tentativa de identificação da vítima.`}
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
              <div className="evidencia-modal-body">
                {renderizarConteudoEvidencia()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}