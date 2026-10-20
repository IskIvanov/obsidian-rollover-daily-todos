import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const isProd = (process.env.BUILD === 'production');

export default {
  input: 'src/index.ts',
  output: {
    file: 'main.js',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript({ noEmit: false, sourceMap: true, inlineSources: !isProd }),
    nodeResolve({ browser: true }),
    commonjs(),
  ]
};
