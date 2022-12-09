
const MyComponent = {
  render(){
    return {
      tag: 'div',
      props: {
        onClick: () => {alert('hello 2')}
      },
      children: 'click me 2'
    }
  }
}

const myVnode = {
  tag: 'div',
  props: {
    onClick: () => {alert('hello')}
  },
  children: [
    'click me',
    {
      tag: MyComponent,
    }
  ]
}

function mountElememt(vnode, container){
  const el = document.createElement(vnode.tag);
  for(const key in vnode.props){
    if(/^on/.test(key)){
      el.addEventListener(key.slice(2).toLocaleLowerCase(), vnode.props[key])
    }
  }
  if(typeof vnode.children === 'string'){
    el.appendChild(document.createTextNode(vnode.children))
  }else if(Array.isArray(vnode.children)){
    vnode.children.forEach(child => {
      let childVnode = child;
      if(typeof child === 'string'){
        childVnode = {tag:'span', children: child};
      }
      renderer(childVnode, el);
    })
  }
  container.appendChild(el);
}
function mountComponnet(vnode,container){
  const subtree = vnode.tag.render();
  renderer(subtree, container);
}
function renderer(vnode, container){
  if(typeof vnode.tag === 'string'){
    mountElememt(vnode, container)
  }else if(typeof vnode.tag === 'object'){
    mountComponnet(vnode, container)
  }
}
renderer(myVnode, document.querySelector('#app'))