import { effect } from '../effect';
import { reactive } from '../reactive';
import { ref, isRef, unRef, proxyRefs } from '../ref';

describe('ref', () => {
  it('happy path', () => {
    const v = ref(1);
    expect(v.value).toBe(1);
  });
  it('should be reactive', () => {
    const v = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = v.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    v.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    v.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it('should make nested propertries reactive', () => {
    const original = ref({ count: 1 });
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = original.value.count;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    original.value.count = 2;
    expect(dummy).toBe(2);
  });
  it('isRef', () => {
    const original = ref(1);
    const user = reactive({ a: 1 });
    expect(isRef(original)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });
  it('unRef', () => {
    const original = ref(1);
    expect(unRef(original)).toBe(1);
    expect(unRef(1)).toBe(1);
  });
  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: 'yay',
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);

    //set
    proxyUser.age = 20;
    expect(user.age.value).toBe(20);
    expect(proxyUser.age).toBe(20);

    proxyUser.age = ref(30);
    expect(user.age.value).toBe(30);
    expect(proxyUser.age).toBe(30);
  });
});
