import path from 'path';
import { defineConfig } from 'vite';
import { CssMila } from './src/index.js';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry: path.resolve(__dirname, './src/index.js'),
            name: 'CssMila',
            fileName: (format) => `css-mila.${format}.js`
        },
        rollupOptions: {
            external: [
                'path',
                'node:fs/promises',
                'colorette',
                'clean-css'
            ]
        }
    }
});