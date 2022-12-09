import { renderer, onMounted, onUnmounted } from './index.js';
import { effect, ref } from '../reactive/index.js';
import {defineAsyncComponent} from './async-component.js';
// const tvnode = {
//   type: 'div',
//   props: {
//     id: 'foo',
//     onClick: [
//       () => {
//         alert('clicked')
//       },
//       () => {
//         console.log('clicked');
//       }
//     ]
//   },
//   children: [
//     {
//       type: 'p',
//       children: 'hello'
//     }
//   ]
// }

// const bol = ref(false);
// const tvnode2 = {
//   type: 'div',
//   props: bol.value ? {
//     onClick: [
//       () => {
//         alert('parent clicked')
//       },
//       () => {
//         console.log('parent clicked');
//       }
//     ]
//   } : {},
//   children: [
//     {
//       type: 'p',
//       props: {
//         onClick: () => {
//           bol.value = true;
//         }
//       },
//       children: 'hello'
//     }
//   ]
// }


// renderer.render(tvnode2, document.querySelector('#app'));
// setTimeout(() => {
//   renderer.render(null, document.querySelector('#app'));
// }, 2000)

// const oldVNode = {
//   type: 'div',
//   children: [
//     {type: 'p', children: '1', key: 1},
//     {type: 'p', children: '2', key: 2},
//     {type: 'p', children: '3', key: 3},
//     {type: 'p', children: '4', key: 4},
//     {type: 'p', children: '6', key: 6},
//     {type: 'p', children: '5', key: 5},
//   ]
// }

// const newVNode = {
//   type: 'div',
//   children: [
//     {type: 'p', children: '1', key: 1},
//     {type: 'p', children: '3', key: 3},
//     {type: 'p', children: '4', key: 4},
//     {type: 'p', children: '2', key: 2},
//     {type: 'p', children: '7', key: 7},
//     {type: 'p', children: '5', key: 5},
//   ]
// }

// renderer.render(oldVNode, document.querySelector('#app'));

// setTimeout(() => {
//   renderer.render(newVNode, document.querySelector('#app'));
// }, 1000)

const Mycomponent = {
  name: 'MyComponent',
  data() {
    return {
      foo: 'hello world'
    }
  },
  // mounted(){
  //   // setTimeout(() => {
  //   this.foo = 'hello vue';
  //   // }, 1000);
  // },
  setup() {
    const bar = ref('bar');
    const list = ref([1, 3, 4, 2, 7, 5]);
    onMounted(() => {
      list.value = [1, 2, 3, 4, 6, 5]
    });
    onUnmounted(() => {
    })
    // setTimeout(() => {
    //   list.value = [
    //     { type: 'p', children: '1', key: 1 },
    //     { type: 'p', children: '2', key: 2 },
    //     { type: 'p', children: '3', key: 3 },
    //     { type: 'p', children: '4', key: 4 },
    //     { type: 'p', children: '6', key: 6 },
    //     { type: 'p', children: '5', key: 5 },
    //   ]
    // }, 2000)
    return {
      bar,
      list,
    }
  },
  render() {
    console.log(this.list.value)
    return {
      type: 'div',
      // props: {
      //   onClick: () => { this.foo = Date.now() },
      // },
      children: [
        { type: 'p', children: '' + this.list.value[0], key: this.list.value[0] },
        { type: 'p', children: '' + this.list.value[1], key: this.list.value[1] },
        { type: 'p', children: '' + this.list.value[2], key: this.list.value[2] },
        { type: 'p', children: '' + this.list.value[3], key: this.list.value[3] },
        { type: 'p', children: '' + this.list.value[4], key: this.list.value[4] },
        { type: 'p', children: '' + this.list.value[5], key: this.list.value[5] },
      ],
    }
  }
};

const MyFuncComp = {
  name: 'MyComponent',
  data() {
    return {
      foo: 'hello world',
      list: [1, 3, 4, 2, 7, 5],
    }
  },
  mounted() {
    setTimeout(() => {
      this.list = [1, 2, 3, 4, 6, 5]
    }, 2000)
  },
  render() {
    return {
      type: 'div',
      children: [
        { type: 'p', children: '' + this.list[0], key: this.list[0] },
        { type: 'p', children: '' + this.list[1], key: this.list[1] },
        { type: 'p', children: '' + this.list[2], key: this.list[2] },
        { type: 'p', children: '' + this.list[3], key: this.list[3] },
        { type: 'p', children: '' + this.list[4], key: this.list[4] },
        { type: 'p', children: '' + this.list[5], key: this.list[5] },
      ],
    }
  }
}

let counter = 0

export function fetch(){
  return new Promise((reolve, reject) => {
    setTimeout(() => {
      reject('err')
    }, 1000);
  })
};

const AsyncComponent = {
  name: 'MyComponent',
  props: {
    title: String
  },
  setup(props, { emit, slots }) {

    return () => {
      return {
        type: 'div',
        children: [
          {
            type: defineAsyncComponent({
              loader: fetch,
              timeout: 0,
              errorComponent: {
                props: {
                  error: Object,
                },
                setup(props) {
                  return () => {
                    return { type: 'h2', children: props.error }
                  }
                }
              },
              delay: 500,
              loadingComponent: {
                setup() {
                  return () => {
                    return { type: 'h2', children: 'Loading...' }
                  }
                }
              },
              onError(retry, reject, retires) {
                counter = retires
                retry()
              }
            })
          }
        ]
      }
    }
  }
};

const CompVnode = {
  type: AsyncComponent,
}
renderer.render(CompVnode, document.querySelector('#app'))


// setTimeout(() => {
//   renderer.render({
//     type: 'div',
//     children: 'empty'
//   }, document.querySelector('#app'));
// }, 4000)