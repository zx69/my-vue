
const MyFuncComp = {
  name: 'MyComponent',
  data() {
    return {
      foo: 'hello world',
      list: [1, 3, 4, 2, 7, 5],
    }
  },
  mounted() {
    setTimeout(() => {
      this.list = [1, 2, 3, 4, 6, 5]
    }, 2000)
  },
  render() {
    return {
      type: 'div',
      children: [
        { type: 'p', children: '' + this.list[0], key: this.list[0] },
        { type: 'p', children: '' + this.list[1], key: this.list[1] },
        { type: 'p', children: '' + this.list[2], key: this.list[2] },
        { type: 'p', children: '' + this.list[3], key: this.list[3] },
        { type: 'p', children: '' + this.list[4], key: this.list[4] },
        { type: 'p', children: '' + this.list[5], key: this.list[5] },
      ],
    }
  }
}

export default MyFuncComp