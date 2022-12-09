const bucket = new Set();

const data = {text: 11};

let activeEffect = null;
const effect = function(fn){

  activeEffect = fn;
  fn();
}

const obj = new Proxy(data, {
  get(target, key){
    if(activeEffect){
      bucket.add(activeEffect);
    }
    return target[key];
  },
  set(target, key, newVal){
    let effects = bucket;
    effects.forEach(fn => fn());
    target[key] = newVal;
  }
})
effect(() => { 
  console.log(`[effect]:`, obj.text);
});

setInterval(() => {
  obj.text++;
}, 2000); 