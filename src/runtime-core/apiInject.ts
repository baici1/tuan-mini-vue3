import { getCurrentInstance } from './component';

export function provide(key, value) {
  //存值
  /**
   * 问题：
   * 1.存在哪里？答：存在 instance 的 provides 属性中
   */
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;
    if (provides == parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  //取值
  /**
   * 问题：
   * 1.在哪儿取？答：父组件的instance 的provides 的属性中拿到
   */
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else {
      if (typeof defaultValue == 'function') {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
