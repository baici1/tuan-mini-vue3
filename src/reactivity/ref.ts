import { isObject } from './../shared/index';
import { hasChanged } from '../shared';
import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';
/**
 * ref和reactive都是响应式对象
 * 从源码形式来讲，ref更像是处理单个元素数据（1 true "1"），reactive处理object对象的。
 * 当ref对象是object的，采用reactive方法进行处理
 */
class RefImpl {
  private _value: any;
  private _rawValue: any;
  public deps: any; //依赖存储
  constructor(value) {
    this._value = convert(value);
    this.deps = new Set();
    this._rawValue = value;
  }
  get value() {
    if (isTracking()) {
      trackEffects(this.deps);
    }
    return this._value;
  }
  set value(newValue) {
    /**
     * 当this._value 是一个对象的话，经过reactive处理后，就是一个Proxy
     * newValue就是一个对象，不可以进行比较的。
     * 利用_rawValue存储原始的value对象进行比较
     */
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.deps);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

/**
 * @description: 接受一个内部值，返回一个响应式的、可更改的 ref 对象，此对象只有一个指向其内部值的属性 .value。
 * @param {*} value
 * @return {*}
 */
export function ref(value) {
  return new RefImpl(value);
}
