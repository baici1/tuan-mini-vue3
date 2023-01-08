import { ShapeFlags } from '../shared/shapeFlags';
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
  //判断vnode 是不是一个elmenet还是一个component，进行对应处理
  console.log(vnode.type);
  /**
   * component -> object
   * elmenet-> string
   */
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    //处理元素
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    //处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
/**
 * @description: 渲染元素节点
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  //存储元素节点的实例
  vnode.el = el;
  //获取 虚拟节点 的子内容children和配置信息props
  const { props, children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // ==渲染元素-> string 类型======================
    //当前节点添加内容
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // ==渲染元素-> array 类型======================
    mountChildren(children, el);
  }
  //添加属性
  for (const key in props) {
    const val = props[key];
    console.log('%c Line:63 🥪 val', 'color:#fca650', val);
    // 开发思路：将具体的click操作重构成通用操作
    // if (key == 'onclick') {
    //   //注册事件监听器
    //   el.addEventListener('click', val);
    // }
    /**
     * 制定规则：
     * key：on+Event name
     */
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      let event = key.slice(2).toLowerCase();
      //注册事件监听器
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
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

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
/**
 * @description: 组件初始化整体流程 1. 创建 2.设置 3.开始渲染
 * @param {any} vnode
 * @param {any} container
 * @return {*}
 */
function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}
/**
 * @description: 准备渲染工作，调用生命周期
 * @param {any} instance
 * @param {any} container
 * @return {*}
 */
function setupRenderEffect(instance: any, initialVNode: any, container: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  console.log('%c Line:100 🍩 subTree', 'color:#42b983', subTree);

  //vnode->patch
  //vnode->element-mountElement
  patch(subTree, container);

  initialVNode.el = subTree.el;
}
