import { renderer, nextTick, h, defineAsyncComponent } from '../../src/renderer/index.js';
import { ref, shallowRef } from '../../src/reactive/index.js';

const VueComp = {
  setup() {
    const name = ref('111');
    const handleClick = () => {
      name.value = '222';
      nextTick(() => {
        const text = document.querySelector("#app").textContent;
        alert('当前Html内容: '+text);
      });
      name.value = '333';
    }
    return {
      name,
      handleClick,
    }
  },
  render() {
    return h('div', { onClick: () => this.handleClick() }, this.name.value)
  }
};

const WrapperVNode = {
  type: VueComp,
}

renderer.render(WrapperVNode, document.querySelector('#app'))
