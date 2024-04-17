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
            minify: true,
            minifyOptions: {
                inline: ['local']
            },
            targets: {
                'index.css'        : 'index1.css',
                'fourth/fourth.css': 'second.css'
            }
        })
    ]
});