import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Claude Paper',
  description: 'Research papers viewer',
  themeConfig: {
    nav: [{ text: 'Library', link: '/' }]
  },
  vite: {
    server: {
      port: 5815,
      watch: {
        ignored: ['!**/node_modules/**']
      }
    }
  }
});
