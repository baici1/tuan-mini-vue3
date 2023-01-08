import { h } from '../../lib/tuan-mini-vue3.esm.js';
import { Foo } from './Foo.js';

export const App = {
  render() {
    return h('div', {}, [
      h('div', {}, 'hi' + this.msg),
      h(Foo, {
        //事件名规则：on+upper Event name
        onAdd(a, b) {
          console.log('on add', a, b);
        },
        onAddFoo() {
          console.log('onAddFoo');
        },
      }),
    ]);
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
