"use client"

import { useState, useEffect } from "react"
import { Download, Info } from "lucide-react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [pwaStatus, setPwaStatus] = useState({
    isStandalone: false,
    supportsServiceWorker: false,
    serviceWorkerRegistered: false,
    manifestLoaded: false,
    canInstall: false,
    debugInfo: [],
  })
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const debugInfo = []

    // Verificar se o app já está instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://")

    debugInfo.push(`App em modo standalone: ${isStandalone}`)

    // Verificar suporte a Service Worker
    const supportsServiceWorker = "serviceWorker" in navigator
    debugInfo.push(`Suporte a Service Worker: ${supportsServiceWorker}`)

    // Verificar se o manifest está carregado
    const manifestLink = document.querySelector('link[rel="manifest"]')
    const manifestLoaded = !!manifestLink
    debugInfo.push(`Manifest encontrado: ${manifestLoaded}`)
    if (manifestLink) {
      debugInfo.push(`Caminho do manifest: ${manifestLink.href}`)
    }

    // Verificar se o Service Worker está registrado
    if (supportsServiceWorker) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        const serviceWorkerRegistered = !!registration
        debugInfo.push(`Service Worker registrado: ${serviceWorkerRegistered}`)
        if (registration) {
          debugInfo.push(`Escopo do Service Worker: ${registration.scope}`)
          debugInfo.push(`Estado do Service Worker: ${registration.active ? "ativo" : "inativo"}`)
        }

        setPwaStatus((prev) => ({
          ...prev,
          serviceWorkerRegistered,
          debugInfo: [...prev.debugInfo, ...debugInfo],
        }))
      })
    }

    setPwaStatus({
      isStandalone,
      supportsServiceWorker,
      serviceWorkerRegistered: false,
      manifestLoaded,
      canInstall: !isStandalone && supportsServiceWorker && manifestLoaded,
      debugInfo,
    })

    // Capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log("Evento beforeinstallprompt capturado!", e)
      // Prevenir o comportamento padrão do navegador
      e.preventDefault()
      // Armazenar o evento para uso posterior
      setDeferredPrompt(e)
      // Mostrar o prompt personalizado
      setShowPrompt(true)

      setPwaStatus((prev) => ({
        ...prev,
        canInstall: true,
        debugInfo: [...prev.debugInfo, "Evento beforeinstallprompt capturado!"],
      }))
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Verificar se o app foi instalado durante a sessão
    window.addEventListener("appinstalled", (event) => {
      console.log("App instalado com sucesso!")
      setShowPrompt(false)
      setDeferredPrompt(null)

      setPwaStatus((prev) => ({
        ...prev,
        isStandalone: true,
        debugInfo: [...prev.debugInfo, "App instalado com sucesso!"],
      }))
    })

    // Mostrar o prompt após 3 segundos para testes
    const testTimer = setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true)
        setPwaStatus((prev) => ({
          ...prev,
          debugInfo: [...prev.debugInfo, "Prompt exibido pelo timer de teste"],
        }))
      }
    }, 3000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      clearTimeout(testTimer)
    }
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) {
      console.log("Exibindo prompt de instalação nativo")
      // Mostrar o prompt de instalação nativo
      deferredPrompt.prompt()

      // Esperar pela escolha do usuário
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log("Resultado da escolha do usuário:", choiceResult.outcome)
        setPwaStatus((prev) => ({
          ...prev,
          debugInfo: [...prev.debugInfo, `Escolha do usuário: ${choiceResult.outcome}`],
        }))

        // Limpar o prompt armazenado
        setDeferredPrompt(null)
      })
    } else {
      console.log("Nenhum prompt de instalação disponível - mostrando instruções manuais")

      // Detectar o navegador para instruções específicas
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge|Edg/i.test(navigator.userAgent)
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome|Edge|Edg/i.test(navigator.userAgent)
      const isFirefox = /Firefox/i.test(navigator.userAgent)
      const isEdge = /Edge|Edg/i.test(navigator.userAgent)

      let instructions = "Para instalar este aplicativo:\n\n"

      if (isMobile) {
        if (isChrome) {
          instructions +=
            "1. Toque no menu (três pontos) no canto superior direito\n2. Selecione 'Adicionar à tela inicial'"
        } else if (isSafari) {
          instructions +=
            "1. Toque no botão de compartilhamento (retângulo com seta para cima)\n2. Role para baixo e selecione 'Adicionar à Tela de Início'"
        } else {
          instructions +=
            "1. Abra este site no Chrome ou Safari\n2. Use o menu do navegador para adicionar à tela inicial"
        }
      } else {
        if (isChrome) {
          instructions +=
            "1. Clique no menu (três pontos) no canto superior direito\n2. Selecione 'Instalar PerioScan...'"
        } else if (isEdge) {
          instructions +=
            "1. Clique no menu (três pontos) no canto superior direito\n2. Selecione 'Aplicativos' > 'Instalar este site como um aplicativo'"
        } else if (isFirefox) {
          instructions +=
            "1. Clique no menu (três linhas) no canto superior direito\n2. Selecione 'Instalar aplicativo'"
        } else {
          instructions +=
            "1. Abra este site no Chrome, Edge ou Firefox\n2. Use o menu do navegador para instalar o aplicativo"
        }
      }

      alert(instructions)

      setPwaStatus((prev) => ({
        ...prev,
        debugInfo: [...prev.debugInfo, "Instruções manuais exibidas"],
      }))
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Instalar PerioScan</h3>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-gray-400 hover:text-gray-600"
              title="Informações de depuração"
            >
              <Info size={16} />
            </button>
          </div>

          {showDebug && (
            <div className="mb-3 p-2 bg-gray-100 rounded text-xs text-gray-700 max-h-40 overflow-y-auto">
              <div className="font-semibold mb-1">Status do PWA:</div>
              <ul className="list-disc pl-4 space-y-1">
                {pwaStatus.debugInfo.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-gray-600 text-sm mb-3">Instale o app para acesso rápido e funcionalidades offline</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              Agora não
            </button>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-black text-white rounded-md text-sm flex items-center"
            >
              <Download size={16} className="mr-1" />
              Instalar
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="ml-2 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
