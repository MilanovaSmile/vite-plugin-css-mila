import { defineConfig } from 'vite';
import CssMila from './src/index.js';

export default defineConfig({
    root: './example',
    build: {
        outDir: '../dist-example',
    },
    plugins: [
        CssMila({
            outDir: '../dist-example',
            minifyOptions: {
                inline: ['local']
            },
            targets: {
                'index.css'     : './example/index.css',
                'the/second.css': './example/fourth/fourth.css'
            }
        })
    ]
});