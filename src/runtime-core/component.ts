import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots } from './componentSlots';
/**
 * @description:创建 组件 instance 对象
 * @param {any} vnode
 * @return {*}
 */
export function createComponentInstance(vnode: any, parent: any) {
  console.log('%c Line:12 🥤 parent', 'color:#4fff4B', parent);
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    emit: () => {},
  };
  //组件挂载 emit
  /**
   * 由于需要传递组件实例对象，但是用户使用则不需要，所以使用 bind 提前传递组件实例对象参数
   */
  component.emit = emit.bind(null, component) as any;
  return component;
}
/**
 * @description: 初始化组件前期内容
 * @param {*} instance
 * @return {*}
 */
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = Component;

  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
    setCurrentInstance(null);
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

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
