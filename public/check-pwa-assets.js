// Este script verifica se os arquivos necessários para o PWA existem
// Execute-o no console do navegador

;(async function checkPwaAssets() {
    console.log("Verificando arquivos do PWA...")
  
    const filesToCheck = [
      "/manifest.json",
      "/sw.js",
      "/images/icons/web-app-manifest-192x192.png",
      "/images/icons/web-app-manifest-512x512.png",
      "/images/icons/logo-periocan114.png",
      "/images/icons/logo-periocan196.png",
      "/images/icons/logo-periocan256.png",
      "/images/icons/logo-periocan512.png",
      "/images/icons/apple-touch-icon.png",
      "/offline",
    ]
  
    const results = {}
  
    for (const file of filesToCheck) {
      try {
        const response = await fetch(file, { method: "HEAD" })
        results[file] = {
          exists: response.ok,
          status: response.status,
          statusText: response.statusText,
        }
      } catch (error) {
        results[file] = {
          exists: false,
          error: error.message,
        }
      }
    }
  
    console.table(results)
  
    // Verificar o manifest.json
    try {
      const manifestResponse = await fetch("/manifest.json")
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json()
        console.log("Conteúdo do manifest.json:", manifest)
  
        // Verificar os ícones do manifest
        if (manifest.icons && manifest.icons.length > 0) {
          console.log(`Encontrados ${manifest.icons.length} ícones no manifest`)
  
          for (const icon of manifest.icons) {
            try {
              const iconResponse = await fetch(icon.src, { method: "HEAD" })
              console.log(`Ícone ${icon.src}: ${iconResponse.ok ? "Existe" : "Não existe"} (${iconResponse.status})`)
            } catch (error) {
              console.error(`Erro ao verificar ícone ${icon.src}:`, error)
            }
          }
        } else {
          console.warn("Nenhum ícone encontrado no manifest.json")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar manifest.json:", error)
    }
  
    // Verificar o registro do Service Worker
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      console.log(`Service Workers registrados: ${registrations.length}`)
  
      registrations.forEach((registration, index) => {
        console.log(`SW #${index + 1} - Escopo: ${registration.scope}`)
        console.log(`SW #${index + 1} - Estado: ${registration.active ? "Ativo" : "Inativo"}`)
      })
    }
  
    return results
  })()
  