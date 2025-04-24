// Adicionar mais logs para depuração
console.log("Service Worker carregado")

// Nome do cache
const CACHE_NAME = "perioscan-cache-v1"

// Recursos para cache inicial
const INITIAL_CACHE_URLS = [
  "/",
  "/offline",
  "/images/logos/logo-perio-scan.png",
  "/images/icons/web-app-manifest-192x192.png",
  "/images/icons/web-app-manifest-512x512.png",
]

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Evento de instalação iniciado")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Cache aberto")
        return cache
          .addAll(INITIAL_CACHE_URLS)
          .then(() => {
            console.log("Service Worker: Todos os recursos foram cacheados com sucesso")
          })
          .catch((error) => {
            console.error("Service Worker: Erro ao cachear recursos:", error)
            return Promise.reject(error)
          })
      })
      .catch((error) => {
        console.error("Service Worker: Erro ao abrir cache:", error)
        return Promise.reject(error)
      }),
  )
  // Força a ativação imediata
  self.skipWaiting()
  console.log("Service Worker: skipWaiting chamado")
})

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Evento de ativação iniciado")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log("Service Worker: Caches existentes:", cacheNames)
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remover caches antigos
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              console.log("Service Worker: Removendo cache antigo:", cacheName)
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => {
        console.log("Service Worker: Ativação concluída")
        return self.clients.claim()
      }),
  )
})

// Estratégia de cache: Network First, fallback para cache
self.addEventListener("fetch", (event) => {
  // Ignorar requisições não GET ou para outros domínios
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes("/api/")
  ) {
    return
  }

  // Log para depuração (limitado para não sobrecarregar o console)
  if (
    event.request.url.includes("manifest.json") ||
    event.request.url.includes(".png") ||
    event.request.url.includes(".ico") ||
    event.request.url.includes("/offline")
  ) {
    console.log("Service Worker: Interceptando fetch para:", event.request.url)
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta para armazenar no cache
        const responseClone = response.clone()

        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)

            // Log para depuração (limitado)
            if (
              event.request.url.includes("manifest.json") ||
              event.request.url.includes(".png") ||
              event.request.url.includes(".ico")
            ) {
              console.log("Service Worker: Armazenado em cache:", event.request.url)
            }
          })
        }

        return response
      })
      .catch(() => {
        console.log("Service Worker: Falha na rede, tentando cache para:", event.request.url)

        // Se falhar, tenta buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          // Se encontrar no cache, retorna
          if (cachedResponse) {
            console.log("Service Worker: Retornando do cache:", event.request.url)
            return cachedResponse
          }

          // Se for uma página HTML e não estiver no cache, retorna a página offline
          if (event.request.headers.get("accept")?.includes("text/html")) {
            console.log("Service Worker: Retornando página offline para:", event.request.url)
            return caches.match("/offline")
          }

          // Caso contrário, retorna um erro
          console.log("Service Worker: Recurso não encontrado no cache:", event.request.url)
          return new Response("Não foi possível carregar o recurso", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          })
        })
      }),
  )
})
