// app/layout.js
"use client"
import "./reset.css"
import "./globals.css"
import { useEffect } from "react"
import InstallPrompt from "@/components/pwa/InstallPrompt"

export default function RootLayout({ children }) {
  // Registrar o service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log("Service Worker é suportado neste navegador")

      // Verificar se já existe um service worker registrado
      navigator.serviceWorker.getRegistration().then((registration) => {
        console.log("Service Worker já registrado?", !!registration)
        if (registration) {
          console.log("Escopo do Service Worker:", registration.scope)
          console.log("Estado do Service Worker:", registration.active ? "ativo" : "inativo")
        }
      })

      // Registrar o service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration)
          console.log("Escopo do Service Worker:", registration.scope)

          // Verificar o estado do service worker
          if (registration.installing) {
            console.log("Service Worker está sendo instalado")
          } else if (registration.waiting) {
            console.log("Service Worker está esperando para ativar")
          } else if (registration.active) {
            console.log("Service Worker está ativo")
          }
        })
        .catch((error) => {
          console.error("Falha ao registrar o Service Worker:", error)
          console.error("Mensagem de erro:", error.message)
          console.error("Nome do erro:", error.name)

          // Verificar se o erro é relacionado a HTTPS
          if (error.message.includes("insecure") || error.message.includes("secure")) {
            console.error("Erro relacionado a HTTPS. O Service Worker requer HTTPS, exceto em localhost.")
          }
        })
    } else {
      console.warn("Service Worker não é suportado neste navegador")
    }
  }, [])
  return (
    <html lang="pt-BR">
      <head>
        <title>PerioScan | Pericias Odontolegais</title>
        <meta
          name="description"
          content="Solução digital especializada no gerenciamento de perícias odontológicas forenses, otimizando processos, organização e segurança das informações periciais."
        />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <>{children}</>
        <InstallPrompt />
      </body>
    </html>
  )
}
