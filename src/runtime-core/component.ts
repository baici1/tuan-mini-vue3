/**
 * @description:创建 组件 instance 对象
 * @param {any} vnode
 * @return {*}
 */
export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
/**
 * @description: 配置组件内容
 * @param {*} instance
 * @return {*}
 */
export function setupComponent(instance) {
  // TODO
  //initProps()
  //initSlots()

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  const { setup } = Component;

  if (setup) {
    const setupResult = setup();

    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult: any) {
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}
