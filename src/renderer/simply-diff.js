import { Text, Fragment } from './types.js';

function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false;
  return key in el; // 判断property的方法
}
function createRender(options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
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
    insert(el, container, anchor);
  }

  function patchKeyedChildren(n1, n2, container){
    const oldChildren = n1.children;
    const newChildren = n2.children;

    let lastIndex = 0; // 找到的最大索引值
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i];
      let j = 0;
      let find = false;
      for (j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j];
        if (newVNode.key === oldVNode.key) {
          find = true;
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            const preVNode = newChildren[i - 1];
            if (preVNode) {
              const anchor = preVNode.el.nextSibling;
              insert(newVNode.el, container, anchor)
            }
          } else {
            lastIndex = j;
          }
          break;
        }
      }
      if (!find) {
        const preVNode = newChildren[i - 1];
        let anchor = null;
        if (preVNode) {
          anchor = preVNode.el.nextSibling;
        } else {
          anchor = container.firstChild;
        }
        patch(null, newVNode, container, anchor);
      }
    }

    for (let i = 0; i < oldChildren.length; i++) {
      const oldVnode = oldChildren[i];
      const has = newChildren.find(vnode => vnode.key === oldVnode.key);
      if (!has) {
        unmount(oldVnode);
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

  function patch(n1, n2, container, anchor) {
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
    } else if (typeof type === 'object') {
      // 组件
    } else if (type === 'xxx') {
      // 其他类型
    }
  }

  function unmount(vnode) {
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c));
      return;
    }
    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el)
    }
  }

  function render(vnode, container) {
    // container.innerHTML = domString;
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      // 有new vnode无旧vnode: 卸载
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