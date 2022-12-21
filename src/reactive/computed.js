import { effect, track, trigger } from './reactive-core.js';

function computed(getterOrOptions) {
  let getter;
  let setter;
  const onlyGetter = typeof getterOrOptions === 'function';
  if(onlyGetter){
    getter = getterOrOptions;
    setter = () => {
        console.warn('Write operation failed: computed value is readonly');
    };
  }else{
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true;
        trigger(obj, 'value');
      }
    }
  });
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    },
    set value(newValue) {
      setter(newValue);
    }
  }
  Object.defineProperty(obj, '__v_isRef', {
    value: true,
  })
  return obj;
}
export {computed}
export default computed;