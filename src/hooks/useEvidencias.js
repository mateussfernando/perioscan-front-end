"use client"

import { useState, useEffect, useCallback } from "react"

export default function useEvidencias(casoId, mostrarNotificacao) {
  const [evidencias, setEvidencias] = useState([])
  const [evidenciasFiltradas, setEvidenciasFiltradas] = useState([])
  const [loadingEvidencias, setLoadingEvidencias] = useState(true)
  const [loadingLaudos, setLoadingLaudos] = useState(true)
  const [tentativaCarregamento, setTentativaCarregamento] = useState(false)
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false)
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false)
  const [modalExcluirEvidenciaAberto, setModalExcluirEvidenciaAberto] = useState(false)
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null)
  const [evidenciaParaExcluir, setEvidenciaParaExcluir] = useState(null)
  const [laudosEvidencias, setLaudosEvidencias] = useState({})
  const [gerandoLaudo, setGerandoLaudo] = useState({})
  const [baixandoPDF, setBaixandoPDF] = useState({})
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false)
  const [excluindoEvidencia, setExcluindoEvidencia] = useState(false)
  const [criandoLaudo, setCriandoLaudo] = useState(false)
  const [erroUpload, setErroUpload] = useState(null)
  const [erroLaudo, setErroLaudo] = useState(null)
  const [erroExclusaoEvidencia, setErroExclusaoEvidencia] = useState(null)

  // Buscar evidências do caso específico
  const fetchEvidencias = useCallback(async () => {
    if (!casoId) {
      setLoadingEvidencias(false)
      return
    }

    try {
      setLoadingEvidencias(true)
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      console.log(`Buscando evidências para o caso: ${casoId}`)

      // Primeira tentativa: usar a rota específica do caso
      try {
        const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const textData = await response.text()

          if (textData) {
            try {
              const data = JSON.parse(textData)

              if (data.success && Array.isArray(data.data)) {
                console.log(`✅ Rota específica funcionou: ${data.data.length} evidências encontradas`)

                // Filtrar apenas evidências que realmente pertencem ao caso
                const evidenciasDoCaso = data.data.filter((evidencia) => {
                  const caseId = evidencia.case || evidencia.caseId
                  return caseId === casoId
                })

                console.log(`📋 Evidências filtradas para o caso: ${evidenciasDoCaso.length}`)
                setEvidencias(evidenciasDoCaso)
                setEvidenciasFiltradas(evidenciasDoCaso)
                return
              }
            } catch (parseError) {
              console.warn("Erro ao parsear resposta da rota específica:", parseError)
            }
          }
        }

        console.log("⚠️ Rota específica não funcionou, tentando abordagem alternativa")
      } catch (error) {
        console.warn("Erro na rota específica:", error)
      }

      // Segunda tentativa: buscar todas as evidências e filtrar manualmente
      console.log("🔄 Usando abordagem de filtro manual")

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/evidence`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar evidências: ${response.status}`)
      }

      const textData = await response.text()

      if (!textData) {
        console.log("Resposta vazia ao buscar evidências")
        setEvidencias([])
        setEvidenciasFiltradas([])
        return
      }

      try {
        const data = JSON.parse(textData)

        if (data.success && Array.isArray(data.data)) {
          console.log(`📊 Total de evidências no sistema: ${data.data.length}`)

          // Filtrar apenas evidências que pertencem ao caso atual
          const evidenciasDoCaso = data.data.filter((evidencia) => {
            const caseId = evidencia.case || evidencia.caseId
            const pertenceAoCaso = caseId === casoId

            if (pertenceAoCaso) {
              console.log(`✅ Evidência pertence ao caso: ${evidencia.description || evidencia.name}`)
            }

            return pertenceAoCaso
          })

          console.log(`🎯 Evidências filtradas para o caso ${casoId}: ${evidenciasDoCaso.length}`)

          setEvidencias(evidenciasDoCaso)
          setEvidenciasFiltradas(evidenciasDoCaso)
        } else {
          console.warn("Formato de resposta inesperado:", data)
          setEvidencias([])
          setEvidenciasFiltradas([])
        }
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError)
        setEvidencias([])
        setEvidenciasFiltradas([])
      }
    } catch (error) {
      console.error("Erro ao buscar evidências:", error)
      setEvidencias([])
      setEvidenciasFiltradas([])
    } finally {
      setLoadingEvidencias(false)
      setTentativaCarregamento(true)
    }
  }, [casoId])

  // Buscar relatórios de evidência do caso específico
  const fetchRelatoriosEvidencia = useCallback(async () => {
    if (!casoId || evidencias.length === 0) {
      setLoadingLaudos(false)
      return
    }

    try {
      setLoadingLaudos(true)
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      console.log(`Buscando relatórios para ${evidencias.length} evidências`)

      // Primeira tentativa: usar a nova rota específica do caso
      try {
        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence-reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()

          if (data.success && Array.isArray(data.data)) {
            console.log(`✅ Relatórios específicos do caso: ${data.data.length}`)

            // Mapear relatórios por evidência
            const laudosMap = {}
            data.data.forEach((relatorio) => {
              if (relatorio.evidence) {
                laudosMap[relatorio.evidence] = relatorio._id || relatorio.id
              }
            })
            setLaudosEvidencias(laudosMap)
            return
          }
        }
      } catch (error) {
        console.warn("Erro na rota específica de relatórios:", error)
      }

      // Segunda tentativa: buscar todos os relatórios e filtrar
      console.log("🔄 Filtrando relatórios manualmente")

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar relatórios: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        // Filtrar apenas relatórios relacionados às evidências do caso atual
        const evidenciaIds = evidencias.map((ev) => ev._id || ev.id)
        console.log(`🎯 IDs das evidências do caso: ${evidenciaIds.join(", ")}`)

        // Mapear relatórios por evidência
        const laudosMap = {}
        data.data.forEach((relatorio) => {
          if (relatorio.evidence && evidenciaIds.includes(relatorio.evidence)) {
            laudosMap[relatorio.evidence] = relatorio._id || relatorio.id
            console.log(`✅ Relatório encontrado para evidência: ${relatorio.evidence}`)
          }
        })

        console.log(`📋 Total de relatórios mapeados: ${Object.keys(laudosMap).length}`)
        setLaudosEvidencias(laudosMap)
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios de evidência:", error)
      setLaudosEvidencias({})
    } finally {
      setLoadingLaudos(false)
    }
  }, [casoId, evidencias])

  // Carregar dados quando o casoId mudar
  useEffect(() => {
    if (casoId) {
      console.log(`🚀 Iniciando carregamento para caso: ${casoId}`)
      // Resetar estado de tentativa para permitir nova carga
      setTentativaCarregamento(false)
      setEvidencias([])
      setEvidenciasFiltradas([])
      setLaudosEvidencias({})
      fetchEvidencias()
    }
  }, [casoId, fetchEvidencias])

  // Carregar relatórios apenas após carregar evidências
  useEffect(() => {
    if (casoId && tentativaCarregamento && !loadingEvidencias && evidencias.length > 0) {
      fetchRelatoriosEvidencia()
    } else if (casoId && tentativaCarregamento && !loadingEvidencias && evidencias.length === 0) {
      // Se não há evidências, não há relatórios para buscar
      setLoadingLaudos(false)
      setLaudosEvidencias({})
    }
  }, [casoId, tentativaCarregamento, loadingEvidencias, evidencias.length, fetchRelatoriosEvidencia])

  // Função de busca
  const handleSearch = (termo) => {
    if (!termo.trim()) {
      setEvidenciasFiltradas(evidencias)
      return
    }

    const filtradas = evidencias.filter(
      (evidencia) =>
        (evidencia.name?.toLowerCase() || "").includes(termo.toLowerCase()) ||
        (evidencia.description?.toLowerCase() || "").includes(termo.toLowerCase()),
    )
    setEvidenciasFiltradas(filtradas)
  }

  // Função de filtro por tipo
  const handleFilter = (filtros) => {
    let resultado = [...evidencias]

    // Filtrar por tipo
    if (filtros.tipo && filtros.tipo !== "todos") {
      resultado = resultado.filter((evidencia) => evidencia.type === filtros.tipo)
    }

    // Filtrar por data de criação
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio)
      resultado = resultado.filter((evidencia) => {
        const dataEvidencia = new Date(evidencia.createdAt || evidencia.collectionDate)
        return dataEvidencia >= dataInicio
      })
    }

    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim)
      dataFim.setHours(23, 59, 59, 999)
      resultado = resultado.filter((evidencia) => {
        const dataEvidencia = new Date(evidencia.createdAt || evidencia.collectionDate)
        return dataEvidencia <= dataFim
      })
    }

    setEvidenciasFiltradas(resultado)
  }

  // Função para abrir modal de visualização
  const abrirEvidenciaModal = (evidencia) => {
    setEvidenciaAtiva(evidencia)
    setModalAberto(true)
  }

  // Função para fechar modal de visualização
  const fecharEvidenciaModal = () => {
    setModalAberto(false)
    setEvidenciaAtiva(null)
  }

  // Função para abrir modal de criar laudo
  const abrirModalCriarLaudo = (evidencia) => {
    setEvidenciaParaLaudo(evidencia)
    setModalCriarLaudoAberto(true)
    setErroLaudo(null)
  }

  // Função para fechar modal de criar laudo
  const fecharModalCriarLaudo = () => {
    setModalCriarLaudoAberto(false)
    setEvidenciaParaLaudo(null)
    setErroLaudo(null)
  }

  // Função para abrir modal de adicionar evidência
  const abrirModalAdicionar = () => {
    setModalAdicionarAberto(true)
    setErroUpload(null)
  }

  // Função para fechar modal de adicionar evidência
  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false)
    setErroUpload(null)
  }

  // Função para abrir modal de excluir evidência
  const abrirModalExcluirEvidencia = (evidencia) => {
    setEvidenciaParaExcluir(evidencia)
    setModalExcluirEvidenciaAberto(true)
    setErroExclusaoEvidencia(null)
  }

  // Função para fechar modal de excluir evidência
  const fecharModalExcluirEvidencia = () => {
    setModalExcluirEvidenciaAberto(false)
    setEvidenciaParaExcluir(null)
    setErroExclusaoEvidencia(null)
  }

  // Função para criar laudo
  const criarLaudo = async (evidencia, dadosLaudo) => {
    setCriandoLaudo(true)
    setErroLaudo(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: dadosLaudo.titulo,
          content: dadosLaudo.conteudo,
          evidence: evidencia._id || evidencia.id,
          findings: dadosLaudo.achados,
          methodology: dadosLaudo.metodologia,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao criar laudo: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Atualizar o mapeamento de laudos
        setLaudosEvidencias((prev) => ({
          ...prev,
          [evidencia._id || evidencia.id]: data.data._id || data.data.id,
        }))

        // Fechar modal
        fecharModalCriarLaudo()

        // Mostrar notificação de sucesso
        mostrarNotificacao("Laudo criado com sucesso!", "success")
      } else {
        throw new Error(data.message || "Erro ao criar laudo")
      }
    } catch (error) {
      console.error("Erro ao criar laudo:", error)
      setErroLaudo(`Falha ao criar laudo: ${error.message}`)
    } finally {
      setCriandoLaudo(false)
    }
  }

  // Função para baixar PDF do laudo
  const baixarPDF = async (evidenciaId, laudoId) => {
    // Atualizar estado para mostrar o loader para este laudo específico
    setBaixandoPDF((prev) => ({ ...prev, [laudoId]: true }))

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      if (!laudoId) {
        throw new Error("Laudo não encontrado para esta evidência")
      }

      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports/${laudoId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Falha ao baixar PDF: ${response.status}`)
      }

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

      mostrarNotificacao("PDF baixado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      mostrarNotificacao(`Erro ao baixar PDF: ${error.message}`, "error")
    } finally {
      // Remover o estado de loading para este laudo
      setBaixandoPDF((prev) => {
        const newState = { ...prev }
        delete newState[laudoId]
        return newState
      })
    }
  }

  // Função para excluir evidência
  const excluirEvidencia = async () => {
    if (!evidenciaParaExcluir) return

    setExcluindoEvidencia(true)
    setErroExclusaoEvidencia(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence/${evidenciaParaExcluir._id || evidenciaParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao excluir evidência: ${response.status} - ${errorText}`)
      }

      // Remover evidência da lista
      const evidenciaId = evidenciaParaExcluir._id || evidenciaParaExcluir.id
      setEvidencias((prev) => prev.filter((ev) => (ev._id || ev.id) !== evidenciaId))
      setEvidenciasFiltradas((prev) => prev.filter((ev) => (ev._id || ev.id) !== evidenciaId))

      // Remover laudo associado se existir
      setLaudosEvidencias((prev) => {
        const newLaudos = { ...prev }
        delete newLaudos[evidenciaId]
        return newLaudos
      })

      // Fechar modal
      fecharModalExcluirEvidencia()

      // Mostrar notificação de sucesso
      mostrarNotificacao("Evidência excluída com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao excluir evidência:", error)
      setErroExclusaoEvidencia(`Falha ao excluir evidência: ${error.message}`)
    } finally {
      setExcluindoEvidencia(false)
    }
  }

  // Função para enviar evidência
  const enviarEvidencia = async (e, dadosEvidencia) => {
    e.preventDefault()
    setEnviandoEvidencia(true)
    setErroUpload(null)

    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      const { tipoEvidencia, descricaoEvidencia, conteudoTexto, imagemSelecionada, tipoImagem } = dadosEvidencia

      // Validações
      if (tipoEvidencia === "image" && !imagemSelecionada) {
        throw new Error("Por favor, selecione uma imagem para upload")
      }

      if (tipoEvidencia === "text" && !conteudoTexto) {
        throw new Error("Por favor, insira o conteúdo do texto")
      }

      if (!descricaoEvidencia) {
        throw new Error("Por favor, insira uma descrição para a evidência")
      }

      // Para evidências do tipo imagem, primeiro fazemos upload da imagem
      let imageUrl = null
      let uploadData = null
      if (tipoEvidencia === "image" && imagemSelecionada) {
        const formData = new FormData()
        formData.append("image", imagemSelecionada)
        formData.append("evidenceType", "caso")
        formData.append("case", casoId)

        const uploadResponse = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Falha ao fazer upload da imagem: ${uploadResponse.status}`)
        }

        const responseText = await uploadResponse.text()

        try {
          uploadData = JSON.parse(responseText)
        } catch (e) {
          throw new Error("A resposta da API não é um JSON válido")
        }

        // Tentar encontrar a URL da imagem
        if (uploadData.data && uploadData.data.url) {
          imageUrl = uploadData.data.url
        } else if (uploadData.url) {
          imageUrl = uploadData.url
        } else if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl
        } else if (uploadData.data && uploadData.data.imageUrl) {
          imageUrl = uploadData.data.imageUrl
        } else if (uploadData.secure_url) {
          imageUrl = uploadData.secure_url
        } else if (uploadData.data && uploadData.data.secure_url) {
          imageUrl = uploadData.data.secure_url
        } else {
          throw new Error("A API de upload não retornou uma URL de imagem válida")
        }

        // Verificar se a URL é válida
        try {
          new URL(imageUrl)
        } catch (e) {
          throw new Error("A URL da imagem retornada é inválida")
        }
      }

      // Agora criamos a evidência com todos os campos necessários
      const evidenciaData = {
        type: tipoEvidencia,
        case: casoId, // IMPORTANTE: Garantir que o caso está sendo definido
        description: descricaoEvidencia,
        content: tipoEvidencia === "text" ? conteudoTexto : "",
        evidenceType: tipoEvidencia === "image" ? "ImageEvidence" : "TextEvidence",
        annotations: [],
        collectedBy: userId,
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

        evidenciaData.imageUrl = imageUrl
        evidenciaData.imageType = tipoImagem

        // Adicionar o objeto cloudinary que o backend espera
        evidenciaData.cloudinary = {
          url: imageUrl,
          public_id: publicId,
        }
      }

      console.log("📤 Enviando evidência:", evidenciaData)

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/evidence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evidenciaData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao criar evidência: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log("✅ Evidência criada com sucesso")

        // Recarregar evidências para garantir que temos os dados mais recentes
        await fetchEvidencias()

        // Fechar modal
        fecharModalAdicionar()

        // Mostrar notificação de sucesso
        mostrarNotificacao("Evidência adicionada com sucesso!", "success")
      } else {
        throw new Error(data.message || "Erro ao criar evidência")
      }
    } catch (error) {
      console.error("Erro ao enviar evidência:", error)
      setErroUpload(`Falha ao enviar evidência: ${error.message}`)
    } finally {
      setEnviandoEvidencia(false)
    }
  }

  return {
    evidencias,
    evidenciasFiltradas,
    loadingEvidencias: loadingEvidencias || loadingLaudos,
    evidenciaAtiva,
    modalAberto,
    modalAdicionarAberto,
    modalCriarLaudoAberto,
    modalExcluirEvidenciaAberto,
    evidenciaParaLaudo,
    evidenciaParaExcluir,
    laudosEvidencias,
    gerandoLaudo,
    baixandoPDF,
    enviandoEvidencia,
    excluindoEvidencia,
    criandoLaudo,
    erroUpload,
    erroLaudo,
    erroExclusaoEvidencia,
    handleSearch,
    handleFilter,
    abrirEvidenciaModal,
    fecharEvidenciaModal,
    abrirModalCriarLaudo,
    fecharModalCriarLaudo,
    abrirModalAdicionar,
    fecharModalAdicionar,
    abrirModalExcluirEvidencia,
    fecharModalExcluirEvidencia,
    criarLaudo,
    baixarPDF,
    excluirEvidencia,
    enviarEvidencia,
  }
}
