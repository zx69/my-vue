export let currentInstance = null
export function setCurrentInstance(instance) {
  const prev = currentInstance
  currentInstance = instance
  return prev
}
// export default { currentInstance, setCurrentInstance }