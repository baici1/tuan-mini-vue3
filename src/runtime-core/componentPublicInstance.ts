import { hasOwn } from '../shared';

//以map形式去适应不同的key，以及对应的函数
const publicPropertiesMap = {
  //this.$el
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    //setupState
    const { setupState, props } = instance;
    // if (key in setupState) {
    //   return setupState[key];
    // }
    //重构
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
