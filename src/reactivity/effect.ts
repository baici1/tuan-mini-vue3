import { extend } from './../shared/index';
// 全局变量
let activeEffect;
let shouldTrack;
/**
 * 构建 ReactiveEffect 类
 * 1.run() 用于执行依赖函数
 * 2.stop() 用于删除某些属性的依赖
 */
class ReactiveEffect {
  private _fn: any;
  public deps: Array<any>;
  active = true;
  onStop?: () => {};
  public scheduler: Function | undefined;
  // tip 在构造函数的参数上使用public等同于创建了同名的成员变量
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
    this.deps = [];
  }
  run() {
    //当执行了stop函数后
    if (!this.active) return this._fn();

    shouldTrack = true;
    // 暴露当前类型给全局对象
    activeEffect = this;
    //将fn函数最后结果返回 执行fn函数时候，会触发get操作
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    //设置状态，防止多次无用清空
    if (this.active) {
      cleanUpEffect(this);
      this.active = false;
      //当存在onStop回调函数，进行回调
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}
/**
 * @description: 清楚 deps 中每一个set里面包含的effect实例
 * @param {*} effect
 */
function cleanUpEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

const targetMap = new Map();
/**
 * @description: 收集依赖
 * @param {*} target
 * @param {*} key
 * @return {*}
 */
export function track(target, key) {
  if (!isTracking()) return;
  //查询路径：traget -> key ->dep（当前target对象得key字段所存在得依赖）
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  /**
   * reactive 的响应式需要靠targetMap，ref的响应式则不需要，对象内部存储
   * 他们之间有重复功能的代码，进行抽离并复用
   */
  trackEffects(deps);
}
export function trackEffects(deps) {
  // tip 优化点：当deps中如果存在activeEffect的话，activeEffect.deps是不需要重复添加的
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

// 判断是否需要收集依赖
export function isTracking() {
  // //当响应式对象没有使用 effect 函数，进行提前返回
  // if (!activeEffect) return;
  // //根据标志决定是否应该收集依赖
  // if (!shouldTrack) return;
  return shouldTrack && activeEffect !== undefined;
}
/**
 * @description: 触发依赖
 * @param {*} target
 * @param {*} key
 * @return {*}
 */
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let deps = depsMap.get(key);
  /**
   * reactive 的响应式需要靠targetMap，ref的响应式则不需要，对象内部存储
   * 他们之间有重复功能的代码，进行抽离并复用
   */
  triggerEffects(deps);
}
export function triggerEffects(deps) {
  //执行 key字段(reactive对象和ref对象)所存在得依赖
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  //fn
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  //options
  /**
   * old _effect.onStop = options.onStop; 不方便，需要手动添加
   * Object.assign(_effect, options); 优雅,但是没有可读性
   * 👉：extend(_effect, options);
   * 创建用于存放公共函数文件，便于使用，提高代码可读性
   */
  extend(_effect, options);

  _effect.run();
  //返回run函数得结果,此处需要指明执行得this来源
  const runner: any = _effect.run.bind(_effect);
  //方便后续函数使用 effect 对象
  runner.effect = _effect;
  return runner;
}
/**
 * @description: stop 对外功能函数
 * @param {*} runner
 */
export function stop(runner) {
  runner.effect.stop();
}
