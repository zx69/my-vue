import { effect, reactive,readonly } from './reactive-core.js';
import computed from './computed.js';
import watch from './watch.js';

let sblKey = Symbol();
const data = { foo: 1, bar: 2, [sblKey]: 3 };
const obj = reactive(data);

// const roObj = readonly(data);

// roObj.foo = 124;

const data2 = [1,2,3,4,5,6,7,8];
const arr = reactive(data2);
// effect(() => {
//   console.log(obj.foo);
  // effect(() => {
  //   console.log('effectFn2 exec');
  //   temp2 = obj.bar;
  // });
// }, {
  // scheduler(fn){
  //   jobQueue.add(fn);
  //   flushJob();
  // },
  // lazy: true,
// })
// obj.foo ++;
// obj.foo ++;

// console.log('end');

// const sumRes = computed(() => obj.foo + obj.bar);
// console.log(sumRes.value);
// obj.foo = 12;
// console.log(sumRes.value);

// effect(() => {
//   console.log(sumRes.value);
// });

// watch(() => obj.foo, (val, oldVal) => {
//   console.log('watch trigger: ', val, oldVal);
// }, { immediate: true });

// setTimeout(() => {
//   console.log('settimeout')
//   obj.foo++;
//   console.log(11);
//   console.log('trigger watch')
// }, 2000)

// effect(() => {
//   // console.log('foo' in obj);
//   console.log(obj.foo)
//   console.log(Object.keys(obj));
// });
// delete obj.foo
//  obj.foo ++;

// effect(() => {
//   console.log(arr.length);
//   // arr.forEach((item,i) => console.log(i, arr[i]))
//   console.log(arr[6])
// });

// arr[0]+=10;
// arr[1]+=10;

// arr[8] = 8;
// arr.length = 0;
// setTimeout(() => {
//   arr.length = 3;
// })

// effect(() => {
//   console.log(obj.foo)
//   console.log(obj[sblKey])
// })

// obj['foo'] = 123;

// let parent = {a:1, b:2};
// let child = {};
// Object.setPrototypeOf(child, parent);
// console.log(child.a);
// Object.defineProperty(parent, 'a', {
//   get(){;
//     console.log('get', this);
//     return this.b;
//   },
//   set(val){
//     console.log('set', this);
//     this.b = val;
//     // return true;
//   }
// })
// child.a = 2;

// let obj1 = {};
// let arr1 = reactive([obj1]);
// console.log(arr1.includes(obj1));
// console.log(arr1.indexOf(obj1));

// let arr2 = reactive([]);
// effect(() => {
//   console.log('push effect 1', arr2.length)
//   // arr2.push(1);
// })
// effect(() => {
//   console.log('push effect 2')
//   arr2.push(2)
// })
// setTimeout(() => {
//   arr2.push(2,3);
//   arr2.unshift(1)
// }, 100)
// effect(() => {
//   console.log('obj: ',obj);
// })

// obj.a = 1;

// const p = reactive(new Set([1,2,3]));
// effect(() => {
//   console.log(p.size);
//   // p.forEach(item => console.log(item))
// })
// p.add(4); 
// setTimeout(() => {
//   p.delete(1);
// })


// const p2 = reactive(new Map([
//   [{key: 1}, {value:1}]
// ]));

// effect(() => {
//   p2.forEach(function(val, key) {
//     console.log(val, key);
//   })
// })

// p2.set({key: 2}, {value:2});

const p = reactive(new Map([
  ['key1', 1],
  ['key2', 2],
]))

// const p2= reactive([3,4,5]);

effect(() => {
  p.forEach(function(val, key){
    console.log(Date.now())
  })
  // p2.forEach(function(val, idnex){
  //   console.log(val)
  // });
  // for(let i=0;i<p2.length;i++){
  //   console.log(Date.now());
  // }
});
setTimeout(() => {
  p.set('key1', 'a');
  // p2[0] = 'b';
},100)