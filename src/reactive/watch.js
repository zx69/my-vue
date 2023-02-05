import { effect } from './reactive-core.js';

// 只是对每个属性值调用读取操作
function traversal(value, seen = new Set()){
  if(typeof value !== 'object' || value === null || seen.has(value)){
    return;
  }
  seen.add(value);
  for(const key in value){
    traversal(value[key], seen);
  }
  return value;
}

function watch(source, cb, options = {}) {
  let getter;
  if(typeof source === 'function'){
    getter = source;
  }else{
    getter = () => traversal(source);
  }

  let oldValue, newValue;
  let cleanUp;
  function onCleanUp(fn){
    cleanUp = fn;
  }
  const job = () => {
    newValue = effectFn();
    // 新调用cb时，可调用用户自定义的清空函数，解决异步竞态问题
    cleanUp && cleanUp(); 
    cb(newValue, oldValue, onCleanUp);
    oldValue = newValue;
  }

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      // flush=pre暂时无法实现
      if(options.flush === 'post'){
        const p = Promise.resolve();
        p.then(job)
      }else{
        job();
      }
    },
  });

  if(options.immediate){
    job();
  }else{
    oldValue = effectFn();
  }
}

export {watch}
export default watch;