import { camelize, toHandlerKey } from '../shared';

export function emit(instance, event, ...args) {
  console.log('%c Line:2 🌰 event', 'color:#7f2b82', event);
  // 根据instance.props 属性，找到event 函数
  const { props } = instance;
  /**
   * 开发思路：
   * 先完成特定行为，流程跑同后，重构成一个通用的行为
   */
  //===特定行为==========================
  // const handler = props['onAdd'];
  // handler && handler();
  //===================================
  //通用行为
  /**
   * 分析:
   * 寻找event规则是on + event 首字母大写
   * 增加规则：将 add-foo 处理成 AddFoo
   * 操作：
   * 1. event 按照规则进行处理
   * 2. 与on 进行结合变成handlerName
   * 3. 适当做一些存在性处理
   */

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
