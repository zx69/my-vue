
const Transition = {
  name: 'Transtion',
  setup(props, {slots}){
    return () => {
      const innerVnode = slots.default();
      innerVnode.transtion = {
        beforeEnter(el){
          el.classList.add('enter-active');
          el.classList.add('enter-from');
        },
        enter(el){
          // nextTick
          requestAnimationFrame(() => {
            el.classList.remove('enter-from');
            el.classList.add('enter-to');
            el.addEventListener('transitionend', () => {
              el.classList.remove('enter-to');
              el.classList.remove('enter-active');
            })
          })
        },
        leave(el, performRemove){
          el.classList.add('leave-active');
          el.classList.add('leave-from');

          document.body.offsetHeight; // 强制reflow,使样式生效
          requestAnimationFrame(() => {
            el.classList.remove('leave-from');
            el.classList.add('leave-to');
            
            el.addEventListener('transtionend', () => {
              el.classList.remove('leave-active');
              el.classList.remove('leave-to');
              performRemove();
            })
          })
        },
      }
    }
  }
}