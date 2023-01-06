import { ReactiveEffect } from './effect';

class computedImpl {
  // 控制 computed 调用标志
  private _dirty: boolean;
  private _value: any;
  private _effect: any;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
    this._dirty = true;
  }
  get value() {
    /**
     * computed会进行懒加载
     * 当内部的响应式对象发生改变时候，应该重新调用
     * 如何知道内部响应式对象发生了改变？
     * effect  scheduler()
     * 当响应式对象 set update的时候不会执行fn 而是执行第二个参数 scheduler函数
     */
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new computedImpl(getter);
}
