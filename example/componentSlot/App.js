import { h, createTextVNode } from '../../lib/tuan-mini-vue3.esm.js';
import { Foo } from './Foo.js';

export const App = {
  render() {
    const app = h('div', {}, 'app');
    const foo = h(
      Foo,
      {},
      {
        //1.普通插槽
        defult: () => [h('p', {}, this.msg), h('p', {}, this.msg)],
        //2.具名插槽
        header: () => [h('p', {}, this.msg + 1), createTextVNode('测试')],
        //3.作用域插槽
        ageSlot: ({ age }) => h('p', {}, this.msg + age),
      }
    );
    return h('div', {}, [app, foo]);
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
