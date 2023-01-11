import { Fragment, Text } from './vnode';
import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { createAppAPI } from './createApp';

/**
 * 自定义渲染功能
 * 现状：目前渲染功能是基于dom 进行开始渲染，渲染节点函数是 mountElement。
 * 目标：希望能够自定义渲染功能，你可以在非 DOM 环境中也享受到 Vue 核心运行时的特性。
 * 解决方案设想：
 *    1.抽离关键节点函数，需要做的行为函数
 *    2.保留整体流程
 *    3.用户实现行为函数，就可以达到预期效果
 * 根据此设想情况，可以采用策略模式进行实现
 * 策略模式：它将对象和行为分开，将行为定义为 一个行为接口 和 具体行为的实现。
 * 实现方案：
 *    1.保留整个流程函数，抽离行为函数成为一个对外接口
 *    2.用户实现接口，具体行为函数
 *    3.实现在dom环境下，具体行为函数
 *
 */

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostProp, insert: hostInsert } = options;

  /**
   * @description: 开始渲染
   * @param {*} vnode
   * @param {*} container
   * @return {*}
   */
  function render(vnode, container) {
    //patch
    patch(vnode, container, null);
  }
  /**
   * @description: 根据当前节点类型判断，选择不同类型的处理process函数
   * @param {*} vnode 当前节点
   * @param {*} container 父节点
   */
  function patch(vnode, container, parentComponent) {
    //console.log(vnode.type);
    const { type, shapeFlag } = vnode;
    /**
     * 增加节点类型
     * 1. Fragment 类型：只渲染子节点children
     * 体现：vue页面能够有多个根节点了等等
     * 2. Text 类型：渲染一个文本节点
     * 默认：
     *  component -> object
     *  elmenet-> string
     *
     */
    switch (vnode.type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  /**
   * @description: 渲染文本节点流程入口
   * @param {any} vnode
   * @param {any} container
   * @return {*}
   */
  function processText(vnode: any, container: any) {
    //获取文本值
    const { children } = vnode;
    const el = document.createTextNode(children);
    vnode.el = el;
    container.append(el);
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    //只渲染子节点
    mountChildren(vnode.children, container, parentComponent);
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }
  /**
   * @description: 渲染元素节点
   * @param {any} vnode
   * @param {any} container
   * @return {*}
   */
  function mountElement(vnode: any, container: any, parentComponent) {
    //const el = document.createElement(vnode.type);
    const el = hostCreateElement(vnode.type);
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
      mountChildren(children, el, parentComponent);
    }
    //添加属性
    for (const key in props) {
      const val = props[key];
      // 开发思路：将具体的click操作重构成通用操作
      // if (key == 'onclick') {
      //   //注册事件监听器
      //   el.addEventListener('click', val);
      // }
      /**
       * 制定规则：
       * key：on+Event name
       */
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   let event = key.slice(2).toLowerCase();
      //   //注册事件监听器
      //   el.addEventListener(event, val);
      // } else {
      //   el.setAttribute(key, val);
      // }

      hostProp(el, key, val);
    }
    //container.append(el);
    hostInsert(el, container);
  }

  /**
   * @description: 渲染子节点
   * @param {*} vnode
   * @param {*} container
   * @return {*}
   */
  function mountChildren(vnode, container, parentComponent) {
    vnode.forEach((v) => {
      patch(v, container, parentComponent);
    });
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent);
  }
  /**
   * @description: 组件初始化整体流程 1. 创建 2.设置 3.开始渲染
   * @param {any} vnode
   * @param {any} container
   * @return {*}
   */
  function mountComponent(initialVNode: any, container: any, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
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

    //vnode->patch
    //vnode->element-mountElement
    patch(subTree, container, instance);

    initialVNode.el = subTree.el;
  }
  return { createApp: createAppAPI(render) };
}
