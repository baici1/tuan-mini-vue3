import { effect } from '../effect';
import { ref } from '../ref';

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
});