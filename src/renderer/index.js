import { Text, Fragment } from './types.js';
import getSequence from './getSequence.js';
import { effect, reactive, shallowReadonly, shallowReactive } from '../reactive/index.js';
import { queuePostFlushCb, queueJob } from './queue-job.js';
import { currentInstance, setCurrentInstance } from './instance.js';

function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false;
  return key in el; // 判断property的方法
}

export function onMounted(fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn);
  } else {
    console.error('onMounted 只能在setup中调用')
  }
}

export function onUnmounted(fn) {
  if (currentInstance) {
    currentInstance.unmounted.push(fn);
  } else {
    console.error('onUnmounted 只能在setup中调用')
  }
}
function createRender(options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
    createText,
    setText,
  } = options;

  function mountElement(vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type);
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el);
      })
    }
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
    const needTranstion = vnode.transtion;
    if(needTranstion){
      vnode.transtion.beforeEnter(el);
    }
    insert(el, container, anchor);
    if(needTranstion){
      vnode.transtion.enter(el);
    }
  }

  function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;
    let j = 0;
    let oldVNode = oldChildren[j];
    let newVNode = newChildren[j];
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      j++;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];
    }
    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];

    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      oldEnd--;
      newEnd--;
      oldVNode = oldChildren[oldEnd];
      newVNode = newChildren[newEnd];
    }
    if (j > oldEnd && j <= newEnd) {
      const anchorIdx = newEnd + 1;
      const anchor = anchorIdx < newChildren.length ? newChildren[anchorIdx].el : null;
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor);
      }
    } else if (j > newEnd && j <= oldEnd) {
      while (j <= oldEnd) {
        unmount(oldChildren[j++])
      }
    } else {
      const count = newEnd - j + 1;
      const source = new Array(count);
      source.fill(-1);

      const oldStart = j;
      const newStart = j;
      let moved = false;
      let pos = 0;

      const keyIndex = {};
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i;
      }
      let patched = 0;
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldChildren[i];
        if (patched <= count) {
          const k = keyIndex[oldVNode.key];
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k];
            patch(oldVNode, newVNode, container);
            patched++;
            source[k - newStart] = i;
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            unmount(oldVNode);
          }
        } else {
          unmount(oldVNode);
        }
      }
      if (moved) {
        const seq = getSequence(source);
        let s = seq.length - 1;
        let i = count - 1;
        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            // 新增节点
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            patch(null, newVNode, container, anchor)
          } else if (i !== seq[i]) {
            // 需要移动
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            insert(newVNode.el, container, anchor)
          } else {
            // 不需移动
            s--;
          }
        }
      }
    }
  }

  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      }
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        patchKeyedChildren(n1, n2, container);
      } else {
        setElementText(container, '');
        n2.children.forEach(c => patch(null, c, container))
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
      }
    }
  }

  function patchElement(n1, n2) {
    const el = n2.el = n1.el;
    const oldProps = n1.props;
    const newProps = n2.props;
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) [
        patchProps(el, key, oldProps[key], newProps[key])
      ]
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }
    patchChildren(n1, n2, el);
  };


  function resolveProps(options, propsData) {
    const props = {};
    const attrs = {};
    for (const key in propsData) {
      // emits也保存到props中
      if (options && key in options || key.startsWith('on')) {
        props[key] = propsData[key]
      } else {
        attrs[key] = propsData[key];
      }
    }
    return [props, attrs];
  }


  function mountComponent(vnode, container, anchor) {
    const isFuntional = typeof vnode.type === 'function';

    let componentOptions = vnode.type;
    if (isFuntional) {
      componentOptions = {
        render: vnode.type,
        props: vnode.type.props,
      }
    }

    let {
      render,
      data,
      setup,
      props: propsOption,
      beforeCreate,
      created,
      beforeMounted,
      mounted,
      beforeUpdate,
      updated,
      unmounted,
    } = componentOptions;

    beforeCreate && beforeCreate(); // 此时没有state,所以拿不到data

    const state = data ? reactive(data()) : null;
    const [props, attrs] = resolveProps(propsOption, vnode.props);

    const slots = vnode.children || {}; // 组件的children会编译成一个vnode对象!

    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null,
      slots,
      mounted: [],
      unmounted: [],
      keepAliveCtx: null,
    }

    const isKeepAlive = vnode.type.__isKeepAlive;
    if (isKeepAlive) {
      instance.keepAliveCtx = {
        move(vnode, container, anchor) {
          insert(vnode.component.subTree.el, container, anchor);
        },
        createElement,
      }
    }

    function emit(event, ...payload) {
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
      const handler = instance.props[eventName];
      if (handler) {
        handler(...payload);
      } else {
        console.error('event not exist')
      }
    }
    const setupContext = { attrs, emit, slots };
    const prevInstance = setCurrentInstance(instance)
    const setupResult = setup && setup(shallowReadonly(instance.props), setupContext);
    setCurrentInstance(prevInstance)
    let setupState = null;
    if (typeof setupResult === 'function') {
      if (render) console.error('setup 函数返回渲染函数, render选项将被忽略');
      render = setupResult;
    } else {
      setupState = setupResult;
    }

    // component保存实例信息
    vnode.component = instance;

    const renderContext = new Proxy(instance, {
      get(t, k, r) {
        const { state, props, slots } = t;
        if (state && k in state) {
          return state[k];
        } else if (k in props) {
          return props[k]
        } else if (setupState && k in setupState) {
          return setupState[k]
        } else if (k === '$slots') {
          // 用于this.$slots.xxx
          return slots;
        } else {
          console.error('not exist')
        }
      },
      set(t, k, v, r) {
        const { state, props } = t;
        if (state && k in state) {
          state[k] = v;
          return true;
        } else if (k in props) {
          props[k] = v;
          return true;
        } else if (setupState && k in setupState) {
          setupState[k] = v;
          return true;
        } else {
          console.error('not exist');
          return false;
        }
      },
      // todo: 加上methods,computed等的代理
    })
    created && created.call(renderContext);

    effect(() => {
      console.log(render);
      const subTree = render.call(renderContext, renderContext);// 改变this, 使render内可用this获取data
      console.log(instance);

      if (!instance.isMounted) {
        beforeMounted && beforeMounted.call(renderContext)
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        mounted && queuePostFlushCb(() => mounted.call(renderContext));
        // instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
        instance.mounted && queuePostFlushCb(() => {
          instance.mounted.forEach(hook => hook.call(renderContext))
        });
      } else {
        beforeUpdate && beforeUpdate.call(renderContext)
        patch(instance.subTree, subTree, container, anchor);
        updated && updated.call(renderContext)
      }
      instance.subTree = subTree;
    }, {
      scheduler: queueJob,
    })
  }

  function hasPropsChange(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key]) return true;
    }
    return false;
  }

  function patchComponent(n1, n2, anchor) {
    const instance = (n2.component = n1.component);
    const { props } = instance;
    if (hasPropsChange(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props);
      for (const k in nextProps) {
        props[k] = nextProps[k];
      }
      for (const k in props) {
        if (!(k in props)) {
          delete props[k]
        }
      }
    }
  }


  function patch(n1, n2, container, anchor) {
    console.log('patch', n2.type)
    // tagName不一样直接替换
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null; // caontiner._vnode = null
    }
    const { type } = n2;
    if (typeof type === 'string') {
      // 普通HTML
      if (!n1) {
        mountElement(n2, container, anchor)
      } else {
        // 更新
        patchElement(n1, n2);
      }
    } else if (type === Text) {
      if (!n1) {
        const el = n2.el = createText(n2.children);
        insert(el, container)
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setText(el, n2.children);
        }
      }
    } else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach(c => patch(null, c, container))
      } else {
        patchChildren(n1, n2, container);
      }
    } else if (typeof type === 'object' && type.__isTeleport) {
      type.process(n1, n2, container, anchor, {
        patch,
        pathcChildren,
        unmount,
        move(vnode, container, anchor) {
          insert(vnode.component
            ? vnode.component.subTree.el
            : vnode.el,
            container,
            anchor
          );
        }
      })
    } else if (typeof type === 'object' || typeof type === 'function') {
      if (!n1) {
        if (n2.keptAlive) {
          n2.keepAliveInstance._activate(n2, container, anchor);
        } else {
          mountComponent(n2, container, anchor);
        }
      } else {
        patchComponent(n1, n2, anchor);
      }
    }
  }

  function unmount(vnode) {
    const needTranstion = vnode.transtion;
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c));
      return;
    } else if (typeof vnode.type === 'object') {
      // console.log(vnode.type, vnode.component);
      if (vnode.shouldKeepAlive) {
        vnode.keepAliveInstance._deActivate(vnode);
      } else {
        vnode.type.unmounted && vnode.type.unmounted();
        vnode.component && vnode.component.unmounted && vnode.component.unmounted.forEach(hook => hook());
        unmount(vnode.component.subTree);
      }
      return;
    }
    const parent = vnode.el.parentNode;
    if (parent) {
      const performRemove = () => parent.removeChild(vnode.el);
      if(needTranstion){
        vnode.transtion.leave(vnode.el, performRemove)
      }else{
        performRemove();
      }
    }
  }

  function render(vnode, container) {
    // container.innerHTML = domString;
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      // 无new vnode有旧vnode: 卸载
      if (container._vnode) {
        unmount(container._vnode);
      };
    }
    container._vnode = vnode;
  }
  return {
    render,
  };
}

const renderer = createRender({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    return el.textContent = text;
  },
  insert(el, parent, anthor = null) {
    parent.insertBefore(el, anthor);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  patchProps(el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            console.log(e.timeStamp, invoker.attatched)
            if (e.timeStamp < invoker.attatched) return;
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e))
            } else {
              invoker.value(e)
            }
          }
          invoker.value = nextValue;
          invoker.attatched = performance.now();
          el.addEventListener(name, invoker);
        } else {
          invoker.value = nextValue;
        }
      }
    } else if (key === 'class') {
      el.className = newValue || '';
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key];
      // 矫正无属性值的情况
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  }
});

export { renderer }
export { defineAsyncComponent } from './async-component.js';

export function nextTick(fn) {
  return fn ? Promise.resolve().then(this ? fn.bind(this) : fn) : Promise.resolve();
}

function createVNode(type, props = null, children = null){
  if(children.length === 1 && typeof children[0] === 'string'){
    children = children[0]
  }
  return {
    type,
    props,
    children,
  }
}

const isObject = (val) => val !== null && typeof val === 'object';
const isArray = Array.isArray;
export function h(type, propsOrChildren, children) {
  if (arguments.length === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
          // props without children
          return createVNode(type, propsOrChildren);
      }else {
          // omit props
          return createVNode(type, null, propsOrChildren);
      }
  }else {
      if (arguments.length > 3) {
          children = Array.prototype.slice.call(arguments, 2);
      }else if (arguments.length === 3) {
          children = [children];
      }
      return createVNode(type, propsOrChildren, children);
  }
}