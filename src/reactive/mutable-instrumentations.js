import { reactive, track, trigger } from "./reactive-core.js";
import { TriggerType, ITERATE_KEY, MAP_KEY_ITERATE_KEY } from './global.js';

const iterationMethod = () => {
  const target = this.raw;
  const itr = target[Symbol.iterator]();
  const wrap = val => typeof val === 'object' && val !== null ? reactive(val) : val;
  track(target, ITERATE_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done,
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

const valuesIterationMethod = () => {
  const target = this.raw;
  const itr = target.values();
  const wrap = val => typeof val === 'object' && val !== null ? reactive(val) : val;
  track(target, ITERATE_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}

const keyesIterationMethod = () => {
  const target = this.raw;
  const itr = target.values();
  const wrap = val => typeof val === 'object' && val !== null ? reactive(val) : val;
  track(target, MAP_KEY_ITERATE_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done
      }
    },
    [Symbol.iterator]() {
      return this
    }
  }
}
const mutableInstrumentaions = {
  add(key) {
    const target = this.raw;
    const hasKey = target.has(key);
    const res = target.add(key);
    if (!hasKey) {
      trigger(target, key, 'ADD');
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hasKey = target.has(key);
    const res = target.delete(key);
    if (hasKey) {
      trigger(target, key, 'DELETE');
    }
    return res;
  },
  get(key) {
    const target = this.raw;
    const had = target.has(key);
    track(target, key);
    if (had) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, val) {
    const target = this.raw;
    const had = target.has(key);
    const oldVal = target.get(key);
    // 响应式数据不可设置到原始数据上，所以这里要检查，如果是响应式数据则取其raw
    const rawVal = val.raw || val;
    target.set(key, rawVal);
    if (!had) {
      trigger(target, key, 'ADD');
    } else if (oldVal !== val || (oldVal === oldVal || newVal === newVal)) {
      trigger(target, key, 'SET');
    }
  },
  forEach(callback, thisArg) {
    const target = this.raw;
    track(target, ITERATE_KEY);
    // typeof set/map => 'object'!!
    const wrap = val => typeof val === 'object' && val !== null ? reactive(val) : val;
    target.forEach((v, k) => {
      callback.call(thisArg, this.get(k), wrap(k), this)
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valuesIterationMethod,
  keys: keyesIterationMethod,
}

export { mutableInstrumentaions }

// 重写的数组方法
const arrayInstrumentaions = {};
let shouldTrack = true;

['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentaions[method] = function (...args) {
    let res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      res = originMethod.apply(this.raw, args);
    }
    return res;
  }
});

['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentaions[method] = function (...args) {
    shouldTrack = false;
    let res = originMethod.apply(this, args);
    shouldTrack = true;
    return res;
  }
});

export { arrayInstrumentaions, shouldTrack }