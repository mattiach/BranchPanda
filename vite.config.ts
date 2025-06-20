import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: "src/content.ts",
        sidebar: "src/sidebar.ts"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "src/sidebar.html", dest: "." },
        { src: "src/sidebar.css", dest: "." },
        // { src: "icons", dest: "." }
      ]
    })
  ]
});
