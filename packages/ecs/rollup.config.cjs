const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'BLFrameworkECS',
        sourcemap: true,
        globals: {},
        exports: 'named'
    },
    plugins: [
        nodeResolve({
            preferBuiltins: false,
            browser: true
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: './dist',
            declarationMap: true,
            sourceMap: true
        })
    ],
    external: []
};

