/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// "base" precisa ser o nome do repositório para o app funcionar no GitHub Pages
// (o link fica https://brennohub.github.io/notacerta/).
export default defineConfig({
  base: "/notacerta/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
  },
});
