import { h, renderSlots } from '../../lib/tuan-mini-vue3.esm.js';

export const Foo = {
  setup() {},
  render() {
    const foo = h('p', {}, 'foo');
    //$slots: 一个表示父组件所传入插槽的对象。
    //每一个插槽都在 this.$slots 上暴露为一个函数，返回一个 vnode 数组，
    //同时 key 名对应着插槽名。默认插槽暴露为 this.$slots.default。
    console.log('%c Line:11 🍻 this.$slots', 'color:#ffdd4d', this.$slots);
    /**
     * 满足功能点：
     * 1. slots 只有一个vnode节点
     * 解决方案：
     *  1.proxy 添加一个接口,返回属性slots
     *  2.组件属性 slots 挂载children
     *
     * 2. slots 是一个数组
     *  解决方案：
     *   1.将slots返回的数组，放置于一个h()函数内，就可以正常显示
     *  原因：vnode的children元素也是一个vnode节点
     * 3. 单个vnode和多个vnode都支持
     *  解决方案：在 initSlots 将单个节点添加进入一个数组中返回
     * 4. 具名插槽
     *   获取需要渲染的元素
     *   找到需要渲染的位置
     * 5. 作用域插槽
     *
     * 以上将所有功能点进行一个整合
     * slot形式就是一个函数
     *
     */
    const age = 18;
    return h('div', {}, [renderSlots(this.$slots, 'defult'), foo, renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'ageSlot', { age }), foo]);
  },
};
