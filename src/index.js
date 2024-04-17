import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cyan, green, red, dim, bold } from 'colorette';
import CleanCSS from 'clean-css';

const VERSION = cyan('CssMila v2.0.5');

let OPTIONS;
let CONFIG;

export default function CssMila (options) {
    OPTIONS = options;

    return {
        name: 'vite-plugin-css-mila',
        enforce: 'pre',
        configResolved(extConfig) {
            CONFIG = extConfig;
        },
        closeBundle: {
            order: 'pre',
            sequential: true,
            async handler () {
                // Print info.
                //------------------------------------------------------------------------------------------------------
                if (options.verbose !== false) console.log('\n' + cyan(VERSION) + green(' building...'));
                //------------------------------------------------------------------------------------------------------

                // Check: outDir.
                //------------------------------------------------------------------------------------------------------
                if (typeof options.outDir !== 'string') {
                    if (options.verbose !== false) console.log(red('outDir is not valid!') + '\n');

                    return;
                }

                switch (options.outDir.length) {
                    case 0:
                        break;

                    case 1:
                        if (options.outDir === '/') options.outDir = '';
                        break;

                    default:
                        if (options.outDir.startsWith('/')) options.outDir = options.outDir.slice(1);
                        if (!options.outDir.endsWith('/')) options.outDir = options.outDir + '/';
                }
                //------------------------------------------------------------------------------------------------------

                // Check: targets.
                //------------------------------------------------------------------------------------------------------
                if (typeof options.targets !== 'object' || Array.isArray(options.targets)) {
                    if (options.verbose !== false) console.log(red('targets is not an object!') + '\n');

                    return;
                }

                if (Object.keys(options.targets).length === 0) {
                    if (options.verbose !== false) console.log(red('targets is empty!') + '\n');

                    return;
                }

                for (let key in options.targets) {
                    if (typeof options.targets[key] !== 'string') {
                        if (options.verbose !== false) console.log(red(`targets key "${key}" is not a string!`) + '\n');

                        return;
                    }
                }
                //------------------------------------------------------------------------------------------------------

                // Start.
                //------------------------------------------------------------------------------------------------------
                let buildTime = performance.now();
                //------------------------------------------------------------------------------------------------------

                let resultList = [];
                let index = 0;

                // Work.
                //------------------------------------------------------------------------------------------------------
                for (let key in options.targets) {
                    index += 1;

                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`transforming (${index}) ${key}`);

                    try {
                        let src = {
                            file: path.resolve(options.targets[key]),
                            content: '',
                            size: 0
                        };

                        let dest = {
                            file: path.resolve(CONFIG.root, options.outDir + key),
                            content: '',
                            size: 0
                        };

                        await mkdir(dest.file.substring(0, dest.file.lastIndexOf('/')), { recursive: true });

                        src.content = await readFile(src.file, 'utf8');

                        src.content = replacePathWithAbsolutPath(src.content, src.file);

                        let result = await minifyCSS(src.content, options.minifyOptions);

                        src.size = result.stats.originalSize;

                        dest.content = result.styles;
                        dest.size = result.stats.minifiedSize;

                        await writeFile(dest.file, dest.content);

                        resultList.push({
                            file: key,
                            srcSize: src.size,
                            destSize: dest.size
                        });
                    } catch (error) {
                        if (options.verbose !== false) {
                            console.log(red(`\nFile: ${key}`));
                            console.log(red(error));
                        }
                    }
                }
                //------------------------------------------------------------------------------------------------------

                // End.
                //------------------------------------------------------------------------------------------------------
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(green('✓ ') + index + ` ${index === 1 ? 'file' : 'files'} transformed.\n`);

                if (options.verbose !== false) {
                    printLog(resultList, options.outDir);
                    console.log(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms\n'));
                }
                //------------------------------------------------------------------------------------------------------
            }
        }
    }
}

function printLog (resultList, outDir) {
    let maxLengthFile = 0;
    let maxLengthSrcSize = 0;
    let maxLengthDestSize = 0;

    resultList.forEach(element => {
        if (element.file.length > maxLengthFile) maxLengthFile = element.file.length;

        element.srcSize = (element.srcSize / 1000).toFixed(2);
        element.destSize = (element.destSize / 1000).toFixed(2);

        if (element.srcSize.length > maxLengthSrcSize) maxLengthSrcSize = element.srcSize.length;
        if (element.destSize.length > maxLengthDestSize) maxLengthDestSize = element.destSize.length;
    });

    resultList.forEach(element => {
        while (element.file.length < maxLengthFile) {
            element.file += ' ';
        }

        while (element.srcSize.length < maxLengthSrcSize) {
            element.srcSize = ' ' + element.srcSize;
        }

        while (element.destSize.length < maxLengthDestSize) {
            element.destSize = ' ' + element.destSize;
        }

        console.log(dim(outDir) + cyan(element.file) + '  ' + dim(bold(element.srcSize + ' kB') + ' │ gzip: ' + element.destSize + ' kB'));
    });
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
    return await new Promise(resolve => {
        new CleanCSS(options).minify(src, (error, output) => {
            return resolve(output);
        });
    });
}