/**
 * 构建 ReactiveEffect 类
 * 1.run() 用于执行依赖函数
 */
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // 暴露当前类型给全局对象
    activeEffect = this;
    this._fn();
  }
}

const targetMap = new Map();
/**
 * @description: 收集依赖
 * @param {*} target
 * @param {*} key
 * @return {*}
 */
export function track(target, key) {
  //查询路径：traget -> key ->dep（当前target对象得key字段所存在得依赖）
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}
/**
 * @description: 触发依赖
 * @param {*} target
 * @param {*} key
 * @return {*}
 */
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  //执行 当前target对象得key字段所存在得依赖
  for (const effect of dep) {
    effect.run();
  }
}

let activeEffect;
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}
