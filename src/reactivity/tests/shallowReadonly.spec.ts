import { isReadonly, shallowReadonly } from '../reactive';

/**
 * @description: shallowReadonly 只把最外层的数据设置为只读模式，深层数据不做要求，非响应式
 */
describe('shallowReadonly', () => {
  it('should not make non-reactive properties reactive', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const props = shallowReadonly(original);
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.bar)).toBe(false);
  });
  //当执行shallowReadonly调用set时候应该给出警告
  it('should call console.warn when set', () => {
    console.warn = jest.fn();
    const user = shallowReadonly({ age: 10 });
    user.age = 11;
    expect(console.warn).toBeCalled();
  });
});
