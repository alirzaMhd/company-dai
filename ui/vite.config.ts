import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createUiDevWatchOptions } from "./src/lib/vite-watch";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    minify: "esbuild",
  },
  // Enable Rolldown for 5-8x faster production builds
  experimental: {
    bundler: "rolldown",
  },
  esbuild:
    mode === "production"
      ? {
          drop: ["console", "debugger"],
          legalComments: "none",
        }
      : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lexical": path.resolve(__dirname, "../node_modules/lexical/Lexical.mjs"),
      // /ui aliases first
      "@paperclipai/adapter-codex-local/ui": path.resolve(__dirname, "../packages/adapters/codex-local/src/ui.ts"),
      "@paperclipai/adapter-cursor-local/ui": path.resolve(__dirname, "../packages/adapters/cursor-local/src/ui.ts"),
      "@paperclipai/adapter-gemini-local/ui": path.resolve(__dirname, "../packages/adapters/gemini-local/src/ui.ts"),
      "@paperclipai/adapter-claude-local/ui": path.resolve(__dirname, "../packages/adapters/claude-local/src/ui.ts"),
      "@paperclipai/adapter-opencode-local/ui": path.resolve(__dirname, "../packages/adapters/opencode-local/src/ui.ts"),
      "@paperclipai/opencode-remote/ui": path.resolve(__dirname, "../packages/adapters/opencode-remote/src/ui.ts"),
      "@paperclipai/adapter-openclaw-gateway/ui": path.resolve(__dirname, "../packages/adapters/openclaw-gateway/src/ui.ts"),
      "@paperclipai/adapter-pi-local/ui": path.resolve(__dirname, "../packages/adapters/pi-local/src/ui.ts"),
      "hermes-paperclip-adapter/ui": path.resolve(__dirname, "../packages/adapters/hermes-local/src/ui.ts"),
      // base aliases (without /ui)
      "@paperclipai/shared": path.resolve(__dirname, "../packages/shared/src/index"),
      "@paperclipai/adapter-utils": path.resolve(__dirname, "../packages/adapter-utils/src/index"),
      "@paperclipai/adapter-codex-local": path.resolve(__dirname, "../packages/adapters/codex-local/src/browser.ts"),
      "@paperclipai/adapter-cursor-local": path.resolve(__dirname, "../packages/adapters/cursor-local/src/browser.ts"),
      "@paperclipai/adapter-gemini-local": path.resolve(__dirname, "../packages/adapters/gemini-local/src/browser.ts"),
      "@paperclipai/adapter-claude-local": path.resolve(__dirname, "../packages/adapters/claude-local/src/index"),
      "@paperclipai/adapter-opencode-local": path.resolve(__dirname, "../packages/adapters/opencode-local/src/index"),
      "@paperclipai/opencode-remote": path.resolve(__dirname, "../packages/adapters/opencode-remote/src/index"),
      "@paperclipai/adapter-openclaw-gateway": path.resolve(__dirname, "../packages/adapters/openclaw-gateway/src/index"),
      "@paperclipai/adapter-pi-local": path.resolve(__dirname, "../packages/adapters/pi-local/src/index"),
      "hermes-paperclip-adapter": path.resolve(__dirname, "../packages/adapters/hermes-local/src/index"),
    },
  },
  server: {
    port: 5173,
    watch: createUiDevWatchOptions(process.cwd()),
    proxy: {
      "/api": {
        target: "http://localhost:3100",
        ws: true,
      },
    },
  },
}));