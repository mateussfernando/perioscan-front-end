/* =============================================
            WORKBOX CONFIGURATION
   ============================================= */

   if (!self.define) {
    let _currentScript;
    const modulesMap = {};
  
    const resolveModule = (modulePath, baseUrl) => {
      const moduleUrl = new URL(`${modulePath}.js`, baseUrl).href;
      
      return modulesMap[moduleUrl] || new Promise(resolve => {
        if ('document' in self) {
          // Carrega o script no DOM para navegadores
          const script = document.createElement('script');
          script.src = moduleUrl;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          // Carrega via importScripts para service workers
          _currentScript = moduleUrl;
          importScripts(moduleUrl);
          resolve();
        }
      }).then(() => {
        const module = modulesMap[moduleUrl];
        if (!module) throw new Error(`Module ${moduleUrl} não registrado`);
        return module;
      });
    };
  
    self.define = (dependencies, factory) => {
      const moduleUrl = _currentScript || 
                       ('document' in self ? document.currentScript.src : '') || 
                       location.href;
      
      if (modulesMap[moduleUrl]) return;
  
      const moduleExports = {};
      const resolveDependency = dep => resolveModule(dep, moduleUrl);
      
      const require = {
        module: { uri: moduleUrl },
        exports: moduleExports,
        require: resolveDependency
      };
  
      modulesMap[moduleUrl] = Promise.all(
        dependencies.map(dep => require[dep] || resolveDependency(dep))
      ).then(resolvedDeps => {
        factory(...resolvedDeps);
        return moduleExports;
      });
    };
  }
  
  /* =============================================
               SERVICE WORKER SETUP
     ============================================= */
  define(['./workbox-4754cb34'], function(workbox) {
    'use strict';
    
    // Configuração inicial do Service Worker
    importScripts();
    self.skipWaiting();
    workbox.clientsClaim();
  
    // Precaching de recursos estáticos
    workbox.precacheAndRoute([
      // Manifestos e chunks estáticos
      { url: '/_next/app-build-manifest.json', revision: 'e8721ab59e1da30d153125225faa300b' },
      { url: '/_next/dynamic-css-manifest.json', revision: 'd751713988987e9331980363e24189ce' },
      // ... (lista de recursos mantida para integridade)
      { url: '/offline.html', revision: '918df85f11a2d5bbc10334dadcf5a65e' }
    ], { ignoreURLParametersMatching: [] });
  
    // Limpeza de caches antigos
    workbox.cleanupOutdatedCaches();
  
    /* =============================================
                 STRATÉGIAS DE CACHE
       ============================================= */
    
    // Página inicial - Network First
    workbox.registerRoute(
      '/',
      new workbox.NetworkFirst({
        cacheName: 'start-url',
        plugins: [{
          cacheWillUpdate: async ({ response }) => 
            response?.type === 'opaqueredirect' 
              ? new Response(response.body, { 
                  status: 200, 
                  headers: response.headers 
                })
              : response
        }]
      }),
      'GET'
    );
  
    // Fontes do Google
    workbox.registerRoute(
      /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      new workbox.StaleWhileRevalidate({
        cacheName: 'google-fonts',
        plugins: [new workbox.ExpirationPlugin({ 
          maxEntries: 4, 
          maxAgeSeconds: 31536000 // 1 ano
        })]
      }),
      'GET'
    );
  
    // Imagens estáticas
    workbox.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new workbox.CacheFirst({
        cacheName: 'static-images',
        plugins: [new workbox.ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 86400 // 24 horas
        })]
      }),
      'GET'
    );
  
    // Assets de áudio e vídeo
    workbox.registerRoute(
      /\.(?:mp3|wav|ogg|mp4)$/i,
      new workbox.CacheFirst({
        cacheName: 'media-assets',
        plugins: [
          new workbox.RangeRequestsPlugin(),
          new workbox.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
          })
        ]
      }),
      'GET'
    );
  
    // Rotas da API
    workbox.registerRoute(
      ({ url }) => 
        url.origin === self.origin && 
        url.pathname.startsWith('/api/') &&
        !url.pathname.startsWith('/api/auth/'),
      new workbox.NetworkFirst({
        cacheName: 'api-requests',
        networkTimeoutSeconds: 10,
        plugins: [new workbox.ExpirationPlugin({
          maxEntries: 16,
          maxAgeSeconds: 86400
        })]
      }),
      'GET'
    );
  
    // Fallback para requisições cross-origin
    workbox.registerRoute(
      ({ url }) => url.origin !== self.origin,
      new workbox.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new workbox.ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 3600 // 1 hora
        })]
      }),
      'GET'
    );
  });