'use strict';

import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cyan, green, red, dim, bold } from 'colorette';
import CleanCSS from 'clean-css';

const OPTIONS = {
    verbose: true,
    minify: true,
    outDir: '',
    minifyOptions: {},
    targets: []
};

const TARGET = {
    src: '',
    dest: ''
}

export function CssMila (options = OPTIONS) {
    let config = undefined;

    options = checkOptions(options);

    if (options.outDir.length === 1) {
        console.log(`${red('CssMila: outDir is not valid!')}`);
        return;
    }

    return {
        name: 'vite-plugin-css-mila',
        configResolved(extConfig) {
            config = extConfig;
        },
        async closeBundle () {
            if (options.targets.length === 0) return;

            await new Promise((resolve) => {
                setTimeout(() => resolve(), 1);
            });

            let buildTime = performance.now();
            let maxFileNameLength = 0;

            options.targets.forEach(target => {
                if (maxFileNameLength < target.dest.length) maxFileNameLength = target.dest.length
            });

            if (options.verbose) console.log(green('\ncss-mila working...'));

            for (let target of options.targets) {
                try {
                    let src  = path.resolve(config.root, target.src);
                    let dest = path.resolve(config.root, options.outDir + target.dest);

                    let srcSize  = 0;
                    let destSize = 0;

                    await mkdir(dest.substring(0, dest.lastIndexOf("/")), {recursive: true});

                    let css = await readFile(src, 'utf8');

                    css = replacePathWithAbsolutPath(css, src);

                    if (options.minify) {
                        let resultObject = await minifyCSS(css, options.minifyOptions);

                        css = resultObject.styles;
                        srcSize = resultObject.stats.originalSize;
                        destSize = resultObject.stats.minifiedSize;
                    }

                    await writeFile(dest, css);

                    if (options.verbose) printLog(options.outDir, target.dest, srcSize, destSize, maxFileNameLength)
                } catch (e) {
                    console.log((`${options.outDir}${cyan(target.dest)} ${red('FAIL')}`));
                }
            }

            if (options.verbose) console.log(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms'));
        }
    }
}

function checkOptions (options) {
    let result = Object.assign({}, OPTIONS);

    for (let key in OPTIONS) {
        switch (true) {
            case ['boolean', 'string'].includes(typeof OPTIONS[key]):
                if (typeof options[key] === typeof OPTIONS[key]) result[key] = options[key];
                if (key === 'outDir' && result.outDir[result.outDir.length - 1] !== '/') result.outDir += '/';
                break;

            case typeof OPTIONS[key] === 'object' && Array.isArray(OPTIONS[key]) && typeof options[key] === 'object' && Array.isArray(options[key]):
                switch (key) {
                    case 'targets':
                        options.targets.forEach(element => {
                            if (typeof element === 'object' && !Array.isArray(element)) {
                                let resultTarget = Object.assign({}, TARGET);

                                for (let objectKey in TARGET) {
                                    if (typeof element[objectKey] === typeof TARGET[objectKey]) resultTarget[objectKey] = element[objectKey];
                                }

                                result.targets.push(resultTarget);
                            }
                        });
                        break;

                    default:
                        result[key] = options[key];
                }
                break
        }
    }

    return result;
}

function printLog (outDir, fileName, srcSize, destSize, maxFileNameLength) {
    while (fileName.length < maxFileNameLength) {
        fileName += ' ';
    }

    srcSize = (srcSize / 1000).toFixed(2);
    destSize = (destSize / 1000).toFixed(2);

    console.log(dim(outDir) + cyan(fileName) + '  ' + dim(bold(srcSize + ' kB') + ' │ gzip: ' + destSize + ' kB'));
}

function replacePathWithAbsolutPath (css, src) {
    const regExp = /@import\s(?:url\()?\s?["'](.*?)["']\s?\)?[^;]*;?/gi;

    let importArray = [];

    css.replace(regExp, (match, url) => {
        if (!url.includes('http')) {
            importArray.push({
                match: match,
                new: match.replace(url, path.relative(process.cwd(), path.resolve(path.dirname(src), url)))
            });
        }
    });

    importArray.forEach(element => {
        css = css.replaceAll(element.match, element.new);
    });

    return css;
}

async function minifyCSS (src, options) {
    return await new Promise((resolve, reject) => {
        new CleanCSS(options).minify(src, (error, output) => {
            return resolve(output);
        });
    });
}