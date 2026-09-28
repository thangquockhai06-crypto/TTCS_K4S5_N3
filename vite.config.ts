import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    port: 3000,
    open: true
  }
=======
    port: 5173,
    host: true,
  },
>>>>>>> d2f841410afb71effb9703b50bd6f7d70a67fe62
});
