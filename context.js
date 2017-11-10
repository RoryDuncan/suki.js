
const nonChainableContextItems = [
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
];


// not defined as a class because we programmatically create the prototype below.
function Context() {
  
  this.canvas = document.createElement("canvas")
  this.context = this.canvas.getContext("2d")
  
}

Context.prototype = (function () {
  
  let proto = {}
  
  let canvas = document.createElement("canvas")
  let context = canvas.getContext("2d")
  
  // used for chaining context methods
  let chainMethod = function(fn, isGetter) {
    if (isGetter) {
      return (...args) => fn.apply(this.context, ...args)
    }
    else return (...args) => {
      fn.apply(this.context, ...args) 
      return this;
    }
  }
  
  // chains a property as a function
  // ->   ctx.text(value) instead of ctx.text = value
  let chainProperty = function(key) {
    return (value) => {
      if (typeof value == "undefined") {
        return this.context[key]
      }
      this.context[key] = value;
      return this;
    }
  }
  
  // for-in iterates over prototype methods, as well
  for (let key in context) {
    let value = context[value]
    let isGetter = false
    
    // detect if it's a method or a property
    if (typeof value == "function") {
      
      if (nonChainableContextItems.includes(key)) {
        isGetter = true
      }
      
      proto[key] = chainMethod(value, isGetter)
    }
    else if (key != "canvas") {
      proto[key] = chainProperty(key)
    }
  }
  return proto;
})()

export default Context