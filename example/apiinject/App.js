// 组件 provide 和 inject 功能
import { h, provide, inject, createTextVNode, getCurrentInstance } from '../../lib/tuan-mini-vue3.esm.js';

/**
 * provide/inject 功能点：
 * 1.父子组件传值
 * 解决方案：
 *    1.instance挂载父组件实例对象
 *    2.instance增加provides 属性存储 provide 得值
 *    3.根据instance对象进行取值
 * 2.多层组件传值
 * 解决方案：
 *    1.instance得provides属性继承父组件得provides属性
 * 3.当前组件 inject key 与 provides key 相同时候，出现误会
 *  原因：
 *    inject 和 provides在操作同一个key时候，存在改变其他组件provide得可能
 *  预期：
 *    无论inject 和provides 怎么执行，inject和provide拥有不同的域，互不干扰，不影响其他provide
 *  解决方法：
 *    1.将provides属性构建新的原型链，__proto__ 指父组件得 provides
 *  理由：
 *    当从一个对象哪里调取属性或者方法的时候，
 *    如果该对象自身不存在这样的属性或方法
 *    ，就会去关联的prototype哪里寻找，
 *    如果prototype没有就会去prototype关联的prototype哪里寻找，
 *    直到prototype的prototype为null的时候。
 *  4.inject可以设置默认值
 * 解决方案：
 *    1.对取得属性进行判断，存在返回，不存在返回默认值
 */

const ProviderOne = {
  setup() {
    provide('foo', 'foo');
    provide('bar', 'bar');
  },
  render() {
    return h('div', {}, [createTextVNode('ProviderOne'), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  setup() {
    // // override parent value
    provide('foo', 'fooOverride');
    //provide('baz', 'baz');
    const foo = inject('foo');
    // // 这里获取的 foo 的值应该是 "foo"
    // // 这个组件的子组件获取的 foo ，才应该是 fooOverride
    // if (foo !== 'foo') {
    //   throw new Error('Foo should equal to foo');
    // }
    return {
      foo,
    };
  },
  render() {
    return h('div', {}, [createTextVNode(`ProviderTwo:${this.foo}`), h(Consumer)]);
  },
};

const Consumer = {
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    //const baz = inject('baz', 'baz');
    const baz = inject('baz', () => 'baz');
    return {
      foo,
      bar,
      baz,
    };
  },
  render() {
    return h('div', {}, `Consumer: ${this.foo}-${this.bar}-${this.baz}`);
  },
};

export default {
  name: 'App',
  setup() {
    // return () => h('div', {}, [h('p', {}, 'apiInject'), h(ProviderOne)]);
  },
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(ProviderOne)]);
  },
};
