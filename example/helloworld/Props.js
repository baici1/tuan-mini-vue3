import { h } from '../../lib/tuan-mini-vue3.esm.js';
export const Foo = {
  setup(props) {
    //1.setup 接受功能
    //2.组件能使用
    //props.count
    console.log('%c Line:3 🍿 props', 'color:#6ec1c2', props);
    //3.props是readonly类型对象
    props.count++;
  },
  render() {
    return h('div', {}, 'foo:' + this.count);
  },
};
