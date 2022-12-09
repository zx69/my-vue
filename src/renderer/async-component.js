import { Text } from './types.js';
import { ref, shallowRef } from '../reactive/ref.js';
import { onUnmounted } from './index.js';

export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = {
      loader: options,
    }
  }
  const {
    loader
  } = options;
  let InnerComp = null;

  let retries = 0;

  function load(){
    return loader().catch(err => {
      if(options.onError){
        return new Promise((resolve, reject) => {
          const retry = () => {
            resolve(load());
            retries ++;
          };
          const fail = () => reject(err);
          options.onError(retry, fail, retries);
        })
      }else{
        throw error;
      }
    })
  }

  return {
    name: 'AsyncComponentWrapper',
    setup() {
      const loaded = ref(false);
      const error = shallowRef(false);
      const loading = ref(false);

      const placeholder = { type: Text, children: '' };

      let loadingTImer = null;
      if(options.delay){
        loadingTImer = setTimeout(() => {
          loading.value = true;
        }, options.delay);
      }else{
        loading.value = false;
      }
      
      load().then(c => {
        InnerComp = c;
        loaded.value = true;
      }).catch(e => {
        error.value = e;
      }).finally(() => {
        loading.value = false;
        clearTimeout(loadingTImer);
      })

      let timer = null;
      if (options.timeout) {
        timer = setTimeout(() => {
          error.value = new Error(`Async component timed out after ${options.timeout}ms`);
        }, options.timeout);
      }
      onUnmounted(() => clearTimeout(timer));

      return () => {
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return { type: options.errorComponent, props: { error: error.value } }
        } else if (loading.value && options.loadingComponent) {
          return { type: options.loadingComponent }
        } else {
          return placeholder;
        }
      }
    }
  }
}