import { resolve } from 'path';
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';

const sharedAlias = {
  '@shared': resolve(__dirname, 'src/shared'),
};
const mainAlias = {
  ...sharedAlias,
  '@main': resolve(__dirname, 'src/main'),
};

export default defineConfig({
  main: {
    resolve: { alias: mainAlias },
    build: {
      externalizeDeps: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    resolve: { alias: mainAlias },
    build: {
      externalizeDeps: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        ...sharedAlias,
        '@renderer': resolve(__dirname, 'src/renderer'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
