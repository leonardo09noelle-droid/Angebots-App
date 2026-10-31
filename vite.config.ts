import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/** Lokal dieselbe /api/offers-Funktion ausführen, die auf Vercel läuft */
function apiDevServer(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/offers", async (req, res) => {
        try {
          const { GET } = await server.ssrLoadModule("/api/offers.ts");
          const response: Response = await GET(new Request(`http://localhost${req.originalUrl}`));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Interner Fehler" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    apiDevServer(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Angebots-Radar",
        short_name: "Angebote",
        description: "Aktuelle Supermarkt-Angebote für deine Lieblingsprodukte",
        lang: "de",
        theme_color: "#0f766e",
        background_color: "#0f766e",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
