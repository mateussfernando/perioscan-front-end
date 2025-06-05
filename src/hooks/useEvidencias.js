"use client"

import { useState, useEffect, useCallback } from "react"

export default function useEvidencias(casoId, mostrarNotificacao) {
  const [evidencias, setEvidencias] = useState([])
  const [evidenciasFiltradas, setEvidenciasFiltradas] = useState([])
  const [loadingEvidencias, setLoadingEvidencias] = useState(true)
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false)
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false)
  const [modalExcluirEvidenciaAberto, setModalExcluirEvidenciaAberto] = useState(false)
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null)
  const [evidenciaParaExcluir, setEvidenciaParaExcluir] = useState(null)
  const [laudosEvidencias, setLaudosEvidencias] = useState({})
  const [gerandoLaudo, setGerandoLaudo] = useState(false)
  const [baixandoPDF, setBaixandoPDF] = useState(false)
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

      // Usar a nova rota específica do caso
      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Caso não tenha evidências, retornar array vazio
          setEvidencias([])
          setEvidenciasFiltradas([])
          return
        }
        throw new Error(`Erro ao buscar evidências: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setEvidencias(data.data)
        setEvidenciasFiltradas(data.data)
      } else {
        console.warn("Formato de resposta inesperado para evidências:", data)
        setEvidencias([])
        setEvidenciasFiltradas([])
      }
    } catch (error) {
      console.error("Erro ao buscar evidências:", error)
      mostrarNotificacao(`Erro ao carregar evidências: ${error.message}`, "erro")
      setEvidencias([])
      setEvidenciasFiltradas([])
    } finally {
      setLoadingEvidencias(false)
    }
  }, [casoId, mostrarNotificacao])

  // Buscar relatórios de evidência do caso específico
  const fetchRelatoriosEvidencia = useCallback(async () => {
    if (!casoId) return

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      // Usar a nova rota para relatórios de evidência específicos do caso
      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}/evidence-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        if (response.status === 404) {
          // Caso não tenha relatórios, retornar objeto vazio
          setLaudosEvidencias({})
          return
        }
        throw new Error(`Erro ao buscar relatórios de evidência: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        // Mapear relatórios por evidência
        const laudosMap = {}
        data.data.forEach((relatorio) => {
          if (relatorio.evidenceId) {
            laudosMap[relatorio.evidenceId] = relatorio._id || relatorio.id
          }
        })
        setLaudosEvidencias(laudosMap)
      } else {
        console.warn("Formato de resposta inesperado para relatórios de evidência:", data)
        setLaudosEvidencias({})
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios de evidência:", error)
      setLaudosEvidencias({})
    }
  }, [casoId])

  // Carregar dados quando o casoId mudar
  useEffect(() => {
    if (casoId) {
      fetchEvidencias()
      fetchRelatoriosEvidencia()
    }
  }, [casoId, fetchEvidencias, fetchRelatoriosEvidencia])

  // Função de busca
  const handleSearch = (termo) => {
    if (!termo.trim()) {
      setEvidenciasFiltradas(evidencias)
      return
    }

    const filtradas = evidencias.filter(
      (evidencia) =>
        evidencia.name?.toLowerCase().includes(termo.toLowerCase()) ||
        evidencia.description?.toLowerCase().includes(termo.toLowerCase()),
    )
    setEvidenciasFiltradas(filtradas)
  }

  // Função de filtro por tipo
  const handleFilter = (tipo) => {
    if (tipo === "todos") {
      setEvidenciasFiltradas(evidencias)
      return
    }

    const filtradas = evidencias.filter((evidencia) => evidencia.type === tipo)
    setEvidenciasFiltradas(filtradas)
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
  const criarLaudo = async (dadosLaudo) => {
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
          ...dadosLaudo,
          evidenceId: evidenciaParaLaudo._id || evidenciaParaLaudo.id,
          caseId: casoId,
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
          [evidenciaParaLaudo._id || evidenciaParaLaudo.id]: data.data._id || data.data.id,
        }))

        // Fechar modal
        fecharModalCriarLaudo()

        // Mostrar notificação de sucesso
        mostrarNotificacao("Laudo criado com sucesso!", "sucesso")
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
  const baixarPDF = async (evidenciaId) => {
    setBaixandoPDF(true)

    try {
      const token = localStorage.getItem("token")
      const laudoId = laudosEvidencias[evidenciaId]

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

      mostrarNotificacao("PDF baixado com sucesso!", "sucesso")
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      mostrarNotificacao(`Erro ao baixar PDF: ${error.message}`, "erro")
    } finally {
      setBaixandoPDF(false)
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
      mostrarNotificacao("Evidência excluída com sucesso!", "sucesso")
    } catch (error) {
      console.error("Erro ao excluir evidência:", error)
      setErroExclusaoEvidencia(`Falha ao excluir evidência: ${error.message}`)
    } finally {
      setExcluindoEvidencia(false)
    }
  }

  // Função para enviar evidência
  const enviarEvidencia = async (formData) => {
    setEnviandoEvidencia(true)
    setErroUpload(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      // Adicionar o caseId ao formData
      formData.append("caseId", casoId)

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/evidence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao enviar evidência: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Recarregar evidências
        await fetchEvidencias()

        // Fechar modal
        fecharModalAdicionar()

        // Mostrar notificação de sucesso
        mostrarNotificacao("Evidência adicionada com sucesso!", "sucesso")
      } else {
        throw new Error(data.message || "Erro ao enviar evidência")
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
    loadingEvidencias,
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
