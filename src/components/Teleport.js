import { patchChildren } from '../renderer/index.js';

export const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { patch, patchChildren, move } = internals;
    if (!n1) {
      const target = typeof n2.props.to === 'string' ? document.querySelector(n2.props.to) : n2.props.to;
      n2.children.forEach(c => patch(null, c, target, anchor));
    } else {
      patchChildren(n1, n2, container);
      if(n2.props.to !== n1.props.to){
        const newTarget = typeof n2.props.to === 'string' 
          ? document.querySelector(n2.props.to)
          : n2.props.to;
        n2.children.forEach(c => move(c, newTarget))
      }
    }
  }
}