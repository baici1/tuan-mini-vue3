import { reactive } from '../reactive';
import { effect } from '../effect';
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
});
