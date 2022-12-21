import { renderer, nextTick, h, defineAsyncComponent, ref, shallowRef } from '../../../src/index.js';
import InfoComp from './Info.js';
import HeaderComp from './Header.js';
import MainComp from './Main.js';
import FooterComp from './Footer.js';


const IndexComp = h('div', {class: 'app'}, [
  h('section', {class: 'todoapp'}, [
    h(HeaderComp),
    h(MainComp),
    h(FooterComp),
  ]),
  h(InfoComp)
]);

export default IndexComp;
