//添加插件，理解ts语法
import typescript from '@rollup/plugin-typescript';
// 从package.json获取出口路径
import pkg from './package.json' assert { type: 'json' };
export default {
  input: './src/index.ts',
  output: [
    //1.cjs->commonjs
    {
      format: 'cjs',
      file: pkg.main, //'lib/tuan-mini-vue3.cjs.js'
    },
    //2.esm
    {
      format: 'es',
      file: pkg.module, //'lib/tuan-mini-vue3.esm.js'
    },
  ],

  plugins: [typescript()],
};
