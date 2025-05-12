import { defineConfig } from 'astro/config';
import htmx from 'astro-htmx';
import node from "@astrojs/node";
import alpinejs from "@astrojs/alpinejs";
// import fulldev from 'fulldev-ui/integration'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  security: {
    checkOrigin: true
  },
  vite: {
    plugins: [tailwindcss()],
  },
  devOptions: {
    // hostname: '0.0.0.0',   // share your development progress on the local network or check out the app from a phone
    // hostname: 'localhost',  // The hostname to run the dev server on.
    // port: 3030,             // The port to run the dev server on.
  },
  output: 'server',
  adapter: node({
    mode: "standalone"
  }),
  integrations: [
    htmx(),
    alpinejs({ entrypoint: "/src/alpineConfig" }),
  ]
});