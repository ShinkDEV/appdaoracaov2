export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Lista de arquivos estáticos que devem ser servidos diretamente
    const staticFiles = [
      '/robots.txt',
      '/sitemap.xml',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/pwa-192x192.png',
      '/pwa-512x512.png',
      '/og-image.png',
      '/placeholder.svg',
      '/_routes.json'
    ];
    
    // Verifica se é um arquivo estático conhecido
    const isStaticFile = staticFiles.includes(url.pathname) || 
                         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|webp|mp4|webm)$/);
    
    // Tenta buscar o asset
    const response = await env.ASSETS.fetch(request);
    
    // Se o asset existe ou é um arquivo estático, retorna diretamente
    if (response.status !== 404 || isStaticFile) {
      return response;
    }
    
    // Para rotas SPA, retorna o index.html
    const indexRequest = new Request(new URL('/', request.url), request);
    return await env.ASSETS.fetch(indexRequest);
  }
};
