import { reactive, shallowReactive } from "./reactive-core.js"


function createRef(val, isShallow = false) {
  const wrapper = {
    value: val
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })
  return isShallow ? shallowReactive(wrapper) : reactive(wrapper);
}

function ref(val) {
  return createRef(val);
}
function shallowRef(val) {
  return createRef(val, true);
}

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  };
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })
  return wrapper;
}


function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  };
  return ret;
}


function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newVal, receiver) {
      const value = target[key];
      if (value.__v_isRef) {
        value.value = newVal;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    }
  })
}

// setup-return的对象会传给proxyRefs 
// const newObj = proxyRefs({...toRefs(obj)});

export { ref, toRef, toRefs, shallowRef, proxyRefs };