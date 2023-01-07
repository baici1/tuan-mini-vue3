import { h } from '../../lib/tuan-mini-vue3.esm.js';

export const App = {
  render() {
    return h(
      'div',
      { id: 'root', class: ['red', 'green'] },
      //'hi,mini-vue'
      [h('p', { class: 'red' }, 'hi'), h('p', { class: 'green' }, 'mini-vue')]
    );
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
