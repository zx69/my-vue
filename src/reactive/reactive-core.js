import { mutableInstrumentaions, arrayInstrumentaions, shouldTrack } from './mutable-instrumentations.js';
import { TriggerType, ITERATE_KEY, MAP_KEY_ITERATE_KEY } from './global.js';

/* eslint-disable consistent-return */
const bucket = new WeakMap();

let activeEffect = null;
const effectStack = [];



export function cleanUp(effectFn) {
  effectFn.deps.forEach((targetDeps) => {
    targetDeps.delete(effectFn);
  });
  effectFn.deps.length = 0;
}

export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanUp(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    // console.log(Date.now())
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

export function track(target, key) {
  // console.warn('track: ', target, key);
  if (!activeEffect || !shouldTrack) {
    return target[key];
  }
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

export function trigger(target, key, type, newVal) {
  console.warn('trigger: ', target, key, type, newVal);
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects && effects.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });
  if ([TriggerType.ADD, TriggerType.DELETE].includes(type)
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects && iterateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  }
  if ([TriggerType.ADD, TriggerType.DELETE].includes(type)
    && (Object.prototype.toString.call(target) === '[object Map]')
  ) {
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    iterateEffects && iterateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  }
  if (Array.isArray(target)) {
    if (type === TriggerType.ADD) {
      const lengthEffects = depsMap.get('length');
      lengthEffects && lengthEffects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
    }
    if (key === 'length') {
      depsMap.forEach((effects, _key) => {
        // 索引值大于新长度的项目才会产生副作用.字符串格式的key进行大小判断会转成NaN,所以不影响下面的分支判断
        if (_key >= newVal) {
          effects.forEach((effectFn) => {
            if (effectFn !== activeEffect) {
              effectsToRun.add(effectFn);
            }
          });
        }
      });
    }
  }
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

// 重写的数组方法
// const arrayInstrumentaions = {};

// ['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
//   const originMethod = Array.prototype[method];
//   arrayInstrumentaions[method] = function(...args){
//     let res = originMethod.apply(this, args);
//     if(res === false || res === -1){
//       res = originMethod.apply(this.raw, args);
//     }
//     return res;
//   }
// })

function isSetOrMap(data) {
  return (data instanceof Set) || (data instanceof Map);
}


function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target;
      }
      if (Array.isArray(target) && arrayInstrumentaions.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentaions, key, receiver);
      }
      // console.log(target, isSetOrMap(target));
      if (isSetOrMap(target)) {
        if (key === 'size') {
          track(target, ITERATE_KEY);
          return Reflect.get(target, key, target);
        }
        // if(mutableInstrumentaions.hasOwnProperty(key)){
        return mutableInstrumentaions[key];
        // }
        // return target[key].bind(target);
      }
      // 只读属性无法修改，所以没必要跟踪响应
      // 不跟踪symbol类型的key的响应,已避免跟踪迭代器(Symbol.iterator)
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }
      // console.log(target, key);
      const res = Reflect.get(target, key, receiver);
      if (isShallow) {
        return res;
      }
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`property ${key} is readonly`);
        return true;
      }
      const oldVal = target[key];

      const type = Array.isArray(target)
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;

      const res = Reflect.set(target, key, newVal, receiver);
      // 加判断避免属性修改导致原型链上的parent也触发set
      if (target === receiver.raw) {
        // 值发送变化时才触发trigger,且排除新旧值都为NaN的情况
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          console.warn(target, key, type, newVal);

          trigger(target, key, type, newVal);
        }
      }
      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`property ${key} is readonly`);
        return true;
      }
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key); // 删除失败会返回false
      if (res && hasKey) {
        trigger(target, key, TriggerType.DELETE);
      }
      return res;
    },
  });
}
const reactiveMap = new Map();
export function reactive(obj) {
  // 如果代理对象之前创建过，则返回该代理对象，避免每次读取深层对象的属性和方法都会新建代理对象，导致前后的代理对象不一致
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy;
}

export function shallowReactive(obj) {
  return createReactive(obj, true);
}

export function readonly(obj) {
  return createReactive(obj, false, true);
}

export function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}
// export const obj = new Proxy(data, {
//   get(target, key, receiver) {
//     track(target, key);
//     return Reflect.get(target, key, receiver);
//   },
//   set(target, key, newVal, receiver) {
//     const oldVal = target[key];
//     const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;
//     const res = Reflect.set(target, key, newVal, receiver);
//     // 值发送变化时才触发trigger,且排除新旧值都为NaN的情况
//     if(oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
//       trigger(target, key, type);
//     }
//     return res;
//   },
//   has(target, key){
//     track(target, key);
//     return Reflect.has(target, key);
//   },
//   ownKeys(target){
//     track(target, ITERATE_KEY);
//     return Reflect.ownKeys(target);
//   },
//   deleteProperty(target, key){
//     const hasKey = Object.prototype.hasOwnProperty.call(target, key);
//     const res = Reflect.deleteProperty(target, key); // 删除失败会返回false
//     if(res && hasKey){
//       trigger(target, key, TriggerType.DELETE)
//     }
//     return res;
//   }
// })


