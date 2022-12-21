import { renderer, nextTick, h } from '../../../src/index.js';
import { useState,useCompouteds, removeCompleted , switchVisiBility } from '../utils/uses.js';

const FooterComp = {
  setup() {
    const state = useState();
    return {
      state,
      ...useCompouteds(),
      switchVisiBility,
      removeCompleted
    }
  },
  render() {
    return !this.state.todos.length ? null : h('footer', { class: 'footer' }, [
      h('span', {class: 'todo-count'}, [
        h('strong', this.remaining),
        h('span', this.remainingText)
      ]),
      h('ul', {class: 'filters'}, [
        h('li', h('a', {
          class: { selected: this.state.visibility == 'all' }, 
          onClick: () => switchVisiBility('all')
        }, 'All')),
        h('li', h('a', {
          class: { selected: this.state.visibility == 'active' }, 
          onClick: () => switchVisiBility('active')
        }, 'Active')),
        h('li', h('a', {
          class: { selected: this.state.visibility == 'completed' }, 
          onClick: () => switchVisiBility('completed')
        }, 'Completed')),
      ]),
      this.state.todos.length > this.remaining ? h('button', {
        class: 'clear-completed', 
        onClick: () => removeCompleted()
      }, 'Clear completed') : null,
    ])
  }
};

export default FooterComp;