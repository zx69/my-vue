
个人跟随[《Vue.js设计与实现》](https://www.douban.com/search?q=vue.js%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)一书实现的"穷人版"Vue.

### 概述

基本实现了Vue的常用api, 包含:

1. vue-reactive相关: 
- reactive/shallowReactive
- ref/toRef/toRefs/shallowRef/proxyRefs
- readonly/shallowReadonly
- computed(get + set)/watch

2. vue-render相关
- effect/nextTick/renderer
- onMounted/onUnmounted 等绝大部分生命周期钩子
- setup/render等组件化实现
- 异步组件AsyncComponent

3. 内置组件KeepAlive/Teleport/Transition

4. 只有运行时,不含编译时部分.

### Demo

目前已实现了基于该`mini-vue`的TodoMVC基本可运行版, 详见`/examples/todomvc`
  - 可能有些边界条件还未处理好.
  - 因为没有编译时,所以dom部分需使用渲染函数编写, 不支持`<template>`

### 《Vue.js设计与实现》个人盲点记录

#### Vue构建版本:
##### vue.global.js
- 用于传统浏览器的IIFE模式包
- 引入方式: `<script src="vue.global.js" />`
- 实现方法: (IIFE)
```
const vue = (function(exports){
    exports.createApp = createApp;
    exports.xxx = xxx;
    return exports;
})({})
```
##### vue.ems-browser.js
- 用于现代浏览器的ems模块包
- 引入方式: `<script type="module" src="vue.ems-browser.js" >`
 
##### vue.ems-bundle.js
- 使用rollup/webpack等打包工具使用的ems版本
- 实现: rollup/webpack等找资源时，如有`module`,会优先取`module`,否则才取`main`,所以使用这类打包工作时output的文件是`vue.ems-bundle.js`
```
// vue/package.json
{
    ...
    "module": "dist/vue.runtime.esm-bundler.js",
}
```
- 区别ems-browser: vue源码中的`__DEV__`变量会替换为`process.env.NODE_ENV !== 'production'`.
    - 因为`__DEV__`为rollup变量，使用通用的`process.env.NODE_ENV`, 用户可在webpack中自行决定构建环境

##### vue.cjs.js
- commonjs版本的vue
- 用于SSR, 在node.js环境中使用

### `HTML Attributes(Attrs)` 与 `DOM Properties(Props)`
- vnode在进行patch算法时需要处理Props的挂载和更新, 所以需要处理Attrs和Props而差异
- Attrs: 定义在html标签上的属性
- Props: 浏览器解析html生成的DOM对象上的属性
- Attrs主要用于html上, 不区分大小写; Props主要用于js上, 区分大小写
- 很多Attrs在DOM对象上有同名的Props
  - 有些不同名, 如class(attrs上)与className(props上)
- 有些Attrs没有对应的Props
  - 如`aria-xxx`
- 有些Props没有对应的Attrs
  - 如`el.textContent`


#### 杂项
- vue3中设置不支持选项式API: 定义`__VUE_OPTION_API__ = false`. 
  - eg：`new webpack.DefinePlugin({__VUE_OPTION_API__: JSON.stringify(false)})`
- `initCustomFormatter`函数用于开发环境自定义console的格式
- Set的无限循环问题：在Set的forEach循环中, 如果删除一个值，再重新加回，则该值会重新被访问。从而会导致无限循环.
  - 解法：构造一个新的Set来循环，在循环中就可以删除原来的Set中的值
  ```
  const set = new Set([1]);
  const newSet = new Set(set);
  newSet.forEach(item => {set.delete(1);set.add(1)})
  ```
- 数组的迭代器其实已通过values暴露：`Array.prototype.values === Array.prototype[Symbol.iterator]`
- `typeof set/map` => `'object'`
- `event.timeStamp`: 获取事件发生时的高精度时间


#### 



