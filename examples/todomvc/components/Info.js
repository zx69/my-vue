import { renderer, nextTick, h, defineAsyncComponent } from '../../../src/index.js';

const InfoComp = {
  name: 'InfoComp',
  render() {
    return h('footer', { class: 'info' }, [
      h('p', 'Double-click to edit a todo'),
      h('p', ['Written by', h('a', { href: 'http://github.com/CharlieLau'}, 'CharlieLau')]),
      h('p', ['Part of', h('a', { href: 'http://todomvc.com'}, 'TodoMVC')]),
    ])
  }
};

export default InfoComp;