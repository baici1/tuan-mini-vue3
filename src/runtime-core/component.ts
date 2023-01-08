import { shallowReadonly } from '../reactivity/reactive';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
/**
 * @description:创建 组件 instance 对象
 * @param {any} vnode
 * @return {*}
 */
export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };
  return component;
}
/**
 * @description: 初始化组件前期内容
 * @param {*} instance
 * @return {*}
 */
export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props);
  //initSlots()

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = Component;

  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props));

    handleSetupResult(instance, setupResult);
  }
}
/**
 * @description: 处理 setup 内容
 * @param {*} instance
 * @param {any} setupResult
 * @return {*}
 */
function handleSetupResult(instance, setupResult: any) {
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
/**
 * @description: 结束组件设置，instance绑定render
 * @param {any} instance
 * @return {*}
 */
function finishComponentSetup(instance: any) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}
