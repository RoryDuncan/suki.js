
const valueReturningMethods = [
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
]

// chains a canvas function, but returns the wrapper parameter
let chainMethod = function(wrapper, fn, isGetter) {
  if (isGetter) {
    return (...args) => fn.apply(wrapper.context, args)
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

// Our wrapper around the Native HTML 2D Rendering Context
// adds the ability to chain context methods
export default class Context {
  
  constructor(width = 500, height = 500) {
    // todo: remove the default width and heights
    this.canvas = document.createElement("canvas")
    this.canvas.width = width
    this.canvas.height = height
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
