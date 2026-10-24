import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import type { PluginOption, UserConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV !== "development";

// Replit-only development plugins. They are imported dynamically and only when
// running in development so production builds (Vercel/Render) don't depend on
// them at runtime.
const devPlugins: PluginOption[] = [];

if (!isProduction) {
  const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
  devPlugins.push(runtimeErrorOverlay.default());

  if (process.env.REPL_ID !== undefined) {
    const [cartographer, devBanner] = await Promise.all([
      import("@replit/vite-plugin-cartographer"),
      import("@replit/vite-plugin-dev-banner"),
    ]);
    devPlugins.push(cartographer.cartographer(), devBanner.devBanner());
  }
}

const config = {
  plugins: [react(), ...devPlugins],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  root: path.resolve(rootDir, "client"),
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
} satisfies UserConfig;

export default config;
