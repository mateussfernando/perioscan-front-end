"use client"

import { useState } from "react"

export default function useVitima(casoId, mostrarNotificacao) {
  const [modalVitimaAberto, setModalVitimaAberto] = useState(false)
  const [salvandoVitima, setSalvandoVitima] = useState(false)
  const [erroSalvarVitima, setErroSalvarVitima] = useState(null)

  const abrirModalVitima = () => {
    setModalVitimaAberto(true)
  }

  const fecharModalVitima = () => {
    setModalVitimaAberto(false)
    setErroSalvarVitima(null)
  }

  const salvarVitima = async (dadosVitima) => {
    setSalvandoVitima(true)
    setErroSalvarVitima(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Usuário não autenticado")
      }

      // Verificar campos obrigatórios
      if (!dadosVitima.name) {
        throw new Error("Nome da vítima é obrigatório")
      }

      if (!dadosVitima.gender) {
        throw new Error("Gênero da vítima é obrigatório")
      }

      if (!dadosVitima.identificationType) {
        throw new Error("Tipo de identificação é obrigatório")
      }

      if (dadosVitima.identificationType === "não_identificada" && !dadosVitima.referenceCode) {
        throw new Error("Código de referência é obrigatório para vítimas não identificadas")
      }

      // Fazer a requisição para adicionar a vítima
      const response = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/victims`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosVitima),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao adicionar vítima: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.success && data.data && (data.data._id || data.data.id)) {
        // Agora vincular a vítima ao caso
        const vitimaId = data.data._id || data.data.id
        const vinculo = await fetch(`https://perioscan-back-end-fhhq.onrender.com/api/victims/${vitimaId}/cases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ caseId: casoId }),
        })
        if (!vinculo.ok) {
          const errorText = await vinculo.text()
          throw new Error(`Vítima criada, mas falha ao vincular ao caso: ${vinculo.status} - ${errorText}`)
        }
        // Fechar o modal
        setModalVitimaAberto(false)
        // Mostrar notificação de sucesso
        mostrarNotificacao("Vítima adicionada e vinculada ao caso com sucesso!", "sucesso")
        // Recarregar a página para mostrar as informações atualizadas
        window.location.reload()
        return true
      } else {
        throw new Error(data.message || "Erro ao adicionar vítima")
      }
    } catch (error) {
      console.error("Erro ao salvar vítima:", error)
      setErroSalvarVitima(`Falha ao salvar vítima: ${error.message}`)
      return false
    } finally {
      setSalvandoVitima(false)
    }
  }

  return {
    modalVitimaAberto,
    salvandoVitima,
    erroSalvarVitima,
    abrirModalVitima,
    fecharModalVitima,
    salvarVitima,
  }
}
