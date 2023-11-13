# Description

Vite plugin for minimizing css. Clean-CSS is used for minification.

# Install

```
yarn add -D vite-plugin-css-mila
```

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import { HtmlMila } from 'vite-plugin-html-mila';

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
     * Write debug to console.
     * Default: true.
     */
    verbose: true,

    /**
     * Path to output directory.
     * Required.
     */
    outDir: '../dist',

    /**
     * Minify CSS file from targets.
     * Default: true.
     */
    minify: true,

    /** Clean-CSS minify options, https://github.com/clean-css/clean-css
     */
    minifyOptions: {},

    /**
     * List of files to process.
     * src - path relative to the "root" variable.
     * dest - path relative to "outDir" variable.
     * src, dest - can only contain a string!
     * Default: [].
     */
    targets: [
        { src: 'target1.html',         dest: 'target1.html' },
        { src: 'example/target2.html', dest: 'example/target2.html' }
    ]
}
```