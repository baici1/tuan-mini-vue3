import { h } from '../../lib/tuan-mini-vue3.esm.js';
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      'div',
      { id: 'root', class: ['red', 'green'] },
      //'hi,mini-vue'
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'green' }, 'mini-vue')]
      'hi,' + this.msg
    );
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
