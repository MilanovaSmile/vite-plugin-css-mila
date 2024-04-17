# Description

Vite plugin for minimizing css. Clean-CSS is used for minification.

# Install

```
yarn add -D vite-plugin-css-mila
```

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import CssMila from 'vite-plugin-css-mila';

export default defineConfig ({
    /**
     * Root directory.
     * Required.
     */
    root: './src',
    
    plugins: [
        CssMila(/* options */)
    ]
});
```

# Options

```javascript
{
    /**
     * Write output to console.
     * Default: true.
     */
    verbose: true,

    /**
     * Path to output directory.
     * Required.
     */
    outDir: '../dist',

    /** Clean-CSS minify options, https://github.com/clean-css/clean-css
     */
    minifyOptions: {},

    /**
     * List of files to process.
     * Default: {}.
     */
    targets: {
        'target.css'        : 'source.css',
        'example/target.css': 'example/source.css'
    }
}
```