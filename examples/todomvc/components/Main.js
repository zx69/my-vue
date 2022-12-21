import { renderer, nextTick, h, onMounted } from '../../../src/index.js';
import { onTodosMounted, useCompouteds, useState, handleEditTodo, removeTodo, cancelEdit, doneEdit } from "../utils/uses.js";

const MainComp = {
  setup() {
    const state = useState();
    onMounted(onTodosMounted);

    return {
      state,
      ...useCompouteds(),
      removeTodo,
      handleEditTodo,
      cancelEdit,
      doneEdit
    }
  },
  render() {
    return h('section', { class: 'main', style: { display: !this.state.todos.length ? 'none' : 'unset' } }, [
      h('input', {
        id: 'toggle-all',
        class: 'toggle-all',
        type: 'checkbox',
        value: this.allDone,
        onInput: (ev) => { this.allDone = ev.target.value },
      }),
      h('label', {
        for: 'toggle-all',
      }, 'Mark all as complete'),
      // h('div', JSON.stringify(this.filteredTodos.map(todo => todo))),
      h('ul', { class: 'todo-list' }, 
        this.filteredTodos.map(todo => {
          return h('li',
            {
              key: todo.id,
              class: {
                completed: todo.completed,
                editing: todo === this.state.editedTodo
              }
            }, [
            h('div', { class: 'view' }, [
              h('input', {
                class: 'toggle',
                type: 'checkbox',
                value: todo.completed,
                onInput: (ev) => { todo.completed = ev.target.value },
              }),
              h('label', {
                onDblclick: () => handleEditTodo(todo)
              }, todo.title),
              h('button', {class: 'destroy', onClick: () => removeTodo(todo)})
            ]),
            h('input', {
              class: 'edit', 
              value: todo.title, 
              onBlur: () => doneEdit(todo),
              onKeyup: (ev) => {
                if(ev.key === 'Enter'){
                  doneEdit(todo)
                }else if(ev.key === 'Esc'){
                  cancelEdit(todo)
                }
              }
            })
          ])
        })
      )
    ])
  }
};

export default MainComp;