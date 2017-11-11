export const noop = () => void 0

export const defer = (fn) => window.setTimeout(fn, 0)

export const deferred = fn => () => defer(fn)

export const chain = (wrapper, context = null, fn) => {
  
  return (...args) => {
    fn.apply(context, ...args)
    return wrapper
  }
}

export default {noop, defer, chain}