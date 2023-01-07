import { h } from '../../lib/tuan-mini-vue3.esm.js';

export const App = {
  render() {
    return h('div', 'hi,' + msg);
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
