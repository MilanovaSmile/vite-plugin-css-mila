import { defineConfig } from 'vite';
import { CssMila } from './src/index.js';

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
            targets: [
                { src: 'index.css', dest: 'index.css' },
                { src: 'fourth/fourth.css', dest: 'second.css' }
            ]
        })
    ]
});