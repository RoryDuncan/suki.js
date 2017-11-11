
const valueReturningMethods = [
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
]

let chainMethod = function(wrapper, fn, isGetter) {
  if (isGetter) {
    return (...args) => fn.apply(wrapper.context, ...args)
  }
  else return (...args) => {
    fn.apply(wrapper.context, args) 
    return wrapper
  }
}

// chains a property as a function
// ->   ctx.text(value) instead of ctx.text = value
let chainProperty = function(wrapper, key) {
  return (value) => {
    if (typeof value == "undefined") {
      return wrapper.context[key]
    }
    wrapper.context[key] = value
    return wrapper
  }
}

// not defined as a class because we programmatically create the prototype below.
export default class Context {
  
  constructor() {
    
    this.canvas = document.createElement("canvas")
    let context = this.context = this.canvas.getContext("2d")
  
    // extend the canvas's context
    // for-in iterates over prototype methods, as well
    for (let key in context) {
      let value = context[key]
      let isGetter = false
      
      // detect if it's a method or a property
      if (typeof value == "function") {
        
        if (valueReturningMethods.includes(key)) {
          isGetter = true
        }
        
        this[key] = chainMethod(this, value, isGetter)
      }
      else if (key != "canvas") {
        this[key] = chainProperty(this, key)
      }
    }
  }
}
