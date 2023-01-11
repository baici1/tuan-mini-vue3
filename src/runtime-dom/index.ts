/*
 * @LastEditTime: 2023-01-11 21:00:40
 * @Description:实现dom环境下，runtime-core对外接口得具体实现函数
 */

import { createRenderer } from '../runtime-core/index';

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, val) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    let event = key.slice(2).toLowerCase();
    //注册事件监听器
    el.addEventListener(event, val);
  } else {
    //设置属性
    el.setAttribute(key, val);
  }
}
function insert(el, container) {
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core';
