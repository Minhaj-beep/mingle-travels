import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const pages = ['index', 'tours', 'fleet', 'gallery', 'about', 'contact', 'credits']

// Replaces <!-- @include file.html --> with the contents of src/partials/file.html,
// so every page shares one header, footer and <head> boilerplate.
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/<!--\s*@include\s+(\S+)\s*-->/g, (_, file) =>
          readFileSync(resolve(__dirname, 'src/partials', file), 'utf8')
        ),
    },
  }
}

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
})
