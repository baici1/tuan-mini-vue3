import { h } from '../../lib/tuan-mini-vue3.esm.js';
import { Foo } from './Props.js';
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'green'],
        //事件注册
        onClick() {
          console.log('click');
        },
        onMousedown() {
          console.log('Mousedown');
        },
      },
      [
        //'hi,mini-vue'
        // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'green' }, 'mini-vue')]
        //'hi,' + this.msg
        h('div', {}, 'hi' + this.msg),
        h(Foo, { count: 1 }),
      ]
    );
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
