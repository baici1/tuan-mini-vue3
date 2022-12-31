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
});
