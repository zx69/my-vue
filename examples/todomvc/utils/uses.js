import {
  reactive,
  watch,
  effect,
  computed
} from '../../../src/index.js'
import todoStorage from './storage.js';

const state = reactive({
  todos: todoStorage.fetch(),
  visibility: 'all',
  editedTodo: null,
  newTodo: ''
})

const filters = {
  all: function (todos) {
    return todos;
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  completed: function (todos) {
    return todos.filter(function (todo) {
      return todo.completed;
    });
  }
}

export function useState() {
  return state
}

export function onTodosMounted() {
  watch(state.todos, () => {
    todoStorage.save(state.todos);
  }, { deep: true, })
}


export function addTodo() {
  const value = state.newTodo.trim()
  if (!value) {
    return
  }
  state.todos.push({
    id: state.todos.length + 1,
    title: value,
    completed: false
  })
  console.log("🚀 ~ file: uses.js:54 ~ state.todos", state.todos)
  state.newTodo = ''
}


export function removeTodo(todo) {
  let index = state.todos.indexOf(todo);
  state.todos.splice(index, 1);
}

export function handleEditTodo(todo) {
  beforeEditCache = todo.title;
  state.editedTodo = todo;
}

export function doneEdit(todo) {
  if (!state.editedTodo) {
    return;
  }
  state.editedTodo = null;
  todo.title = todo.title.trim();
  if (!todo.title) {
    removeTodo(todo);
  }
}

export function cancelEdit(todo) {
  state.editedTodo = null;
  todo.title = beforeEditCache;
}

export function removeCompleted() {
  state.todos = filters.active(state.todos);
}

export function switchVisiBility(visibility) {
  state.visibility = visibility
}



function pluralize(word, count) {
  return word + (count === 1 ? '' : 's');
}

export function useCompouteds() {
  const filteredTodos = computed(() => {
    return filters[state.visibility](state.todos);
  });
  const remaining = computed(() => {
    return filters.active(state.todos).length;
  });
  const allDone = computed({
    get: function () {
      return remaining.length === 0;
    },
    set: function (value) {
      state.todos.forEach(function (todo) {
        todo.completed = value;
      });
    }
  });
  const remainingText = computed(() => {
    return ` ${pluralize(remaining.value)} left`
  })

  return {
    filteredTodos,
    remaining,
    allDone,
    remainingText
  }
}