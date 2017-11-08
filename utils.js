export const noop = () => void 0

export const defer = (fn) => window.setTimeOut(fn, 0)

export const chain = (wrapper, context = null, fn) => {
  
  return (...args) => {
    fn.apply(context, ...args)
    return wrapper
  }
}