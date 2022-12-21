import { renderer, nextTick, h } from '../../../src/index.js';
import { useState, addTodo } from '../utils/uses.js';

const HeaderComp = {
  setup() {
    const state = useState();
    return {
      state,
      addTodo,
    }
  },
  render() {
    return h('header', { class: 'header' }, [
      // h('div', this.state.newTodo),
      h('h1', 'todos'),
      h('input', {
        class: 'new-todo',
        autofocus: true,
        placeholder: 'What needs to be done?',
        value: this.state.newTodo,
        onInput: (ev) => { this.state.newTodo = ev.target.value },
        onKeyup: (ev) => {
          if(ev.key === 'Enter'){
            this.addTodo();
          }
        }
      }),
    ])
  }
};

export default HeaderComp;