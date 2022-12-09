import { currentInstance, setCurrentInstance } from '../renderer/instance.js';

const cache = new Map();

export const KeepAlive = {
  __isKeepAlive: true,
  props: {
    include: RegExp,
    exclude: RegExp,
  },
  setup(props, { slots }) {
    const instance = currentInstance;
    const {move, createElement } = instance.keepAliveCtx;
    const storageContainer = createElement('div'); // 只是个临时挂载点,不需要持久化, 所以放setup里面就行

    instance._deActivate = (vnode) => {
      move(vnode, storageContainer);
    }
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor);
    }

    return () => {
      let rawVNode = slots.default();
      if(typeof rawVNode.type !== 'object'){
        return rawVNode;
      }
      const name = rawVNode.type.name;
      if(
        name && 
        ((props.include && !props.include.test(name)) || 
        (props.exclude && props.exclude.test(name)))
      ){
        return rawVNode;
      }

      const cachedVNode = cache.get(rawVNode.type);
      if(cachedVNode){
        rawVNode.component = cachedVNode.component; // 修正组件实例
        rawVNode.keptAlive = true;
      }else{
        cache.set(rawVNode.type, rawVNode);
      }

      rawVNode.shouldKeepAlive = true;
      rawVNode.keepAliveInstance = instance;
      return rawVNode;
    }
  }
}