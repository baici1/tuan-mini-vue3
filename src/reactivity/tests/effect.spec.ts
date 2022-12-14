import { reactive } from '../reactive';
import { effect, stop } from '../effect';
/**
 * @description:effect测试
 */
describe('effect', () => {
  /**
   * 1.reactive函数对数据user进行proxy劫持
   * 2.调用effect函数，传入用户定义函数
   * 3.用户定义函数会自执行一次，其内存在对数据的调用，触发了get操作
   * 4.对数据的调用会触发proxy接触
   *    4.1如果是触发get,则把当前触发的属性和当前effect绑定
   *    4.2如果触发set，则把当前属性绑定的effect取出，并调用，使之进行数据更行
   */
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    //update
    user.age++;
    expect(nextAge).toBe(12);
  });
  /**
   * 当fn函数存在 return 时候情况
   */
  it('should return runner when call effect', () => {
    //1. effect(fn)->function(runner) ->fn ->return
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });
  /**
   * @description 调度器，用于处理异步任务
   * 1. 通过effect的第二个参数给定一个 scheduler 的 fn
   * 2. effect 会执行 fn
   * 3. 当响应式对象 set update的时候不会执行fn 而是执行第二个参数 scheduler函数
   * 4. 然后执行runner的时候，会再次执行 fn
   */
  it('scheduler', () => {
    //
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);

    // manually run 手动执行run
    run();
    // should have run
    expect(dummy).toBe(2);
  });
  /**
   * @description stop 功能：停止数据响应，只有手动触发run的函数，数据才能够完成响应
   * 1.没有使用stop，数据会自动更新
   * 2.使用了stop后。数据停止更新
   * 3.手动调用effect函数，数据继续开始更新
   */
  it('stop', () => {
    let dummy: unknown;
    let test: unknown;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    const runner2 = effect(() => {
      test = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    expect(test).toBe(2);
    // 执行stop 阻止runner的执行
    stop(runner);
    // 进行了set操作
    //obj.prop = 3;
    // bug:当进行get操作时候，会重新收集依赖并触发依赖
    obj.prop++;
    expect(dummy).toBe(2);
    expect(test).toBe(3);

    // stoped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  /**
   * @description: 调用stop后的回调函数，允许调用stop后可进行其它操作
   * @param {*} onStop
   */
  it('onStop', () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy: number;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
