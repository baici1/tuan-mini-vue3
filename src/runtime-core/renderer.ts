import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from './component';

/**
 * @description: 开始渲染
 * @param {*} vnode
 * @param {*} container
 * @return {*}
 */
export function render(vnode, container) {
  //patch
  patch(vnode, container);
}
/**
 * @description: 根据当前节点类型判断，选择不同类型的处理process函数
 * @param {*} vnode 当前节点
 * @param {*} container 父节点
 */
function patch(vnode, container) {
  // TODO
  //判断vnode 是不是一个elmenet还是一个component，进行对应处理
  console.log(vnode.type);
  /**
   * component -> object
   * elmenet-> string
   */
  if (typeof vnode.type == 'string') {
    //处理元素
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    //处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
/**
 * @description: 组件初始化，初始渲染
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);

  //获取 虚拟节点 的子内容children和配置信息props
  const { props, children } = vnode;
  if (typeof children == 'string') {
    // ==渲染元素-> string 类型======================
    //当前节点添加内容
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  //添加属性
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
/**
 * @description: 组件初始化
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
/**
 * @description: 准备渲染工作，调用生命周期
 * @param {any} instance
 * @param {any} container
 * @return {*}
 */
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();

  //vnode->patch
  //vnode->element-mountElement

  patch(subTree, container);
}

/**
 * @description: 渲染子节点
 * @param {*} vnode
 * @param {*} container
 * @return {*}
 */
function mountChildren(vnode, container) {
  vnode.forEach((v) => {
    patch(v, container);
  });
}
