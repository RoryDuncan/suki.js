

const keyCodes = {
  8:    "backspace",
  9:    "tab",
  13:   "enter",
  16:   "shift",
  17:   "ctrl",
  18:   "alt",
  19:   "pause",
  20:   "caps-lock",
  27:   "escape",
  32:   "space",
  33:   "pageup",
  34:   "pagedown",
  35:   "end",
  36:   "home",
  37:   "left",
  38:   "up",
  39:   "right",
  40:   "down",
  45:   "insert",
  46:   "delete",
  
  // alphabetical chars are here
  
  96:   "numpad-0",
  97:   "numpad-1",
  98:   "numpad-2",
  99:   "numpad-3",
  100:  "numpad-4",
  101:  "numpad-5",
  102:  "numpad-6",
  103:  "numpad-7",
  104:  "numpad-8",
  105:  "numpad-9",
  106:  "numpad-mul",
  107:  "numpad-add",
  109:  "numpad-sub",
  110:  "numpad-dec",
  111:  "numpad-div",
  112:  "f1",
  113:  "f2",
  114:  "f3",
  115:  "f4",
  116:  "f5",
  117:  "f6",
  118:  "f7",
  119:  "f8",
  120:  "f9",
  121:  "f10",
  122:  "f11",
  123:  "f12",
  144:  "num-lock",
  145:  "scroll-lock",
  186:  "semicolon",
  187:  "equal",
  188:  "comma",
  189:  "dash",
  190:  "period",
  191:  "slash",
  192:  "grave-accent",
  219:  "open-bracket",
  220:  "backslash",
  221:  "close-bracket",
  222:  "single-quote",
}


export class Keyboard {
  
  constructor(element) {
    this.disabled = false
    this.element = element || document
    
    // all of our keycodes that aren't alphabetical characters
    this.keyCodes = keyCodes
    
    // an array of all currently pressed keys
    this.pressed = []
    this.defaultAllowed = {
      "ctrl": true,
    }
    // a lookup table for if a key is pressed
    this.keys = []
    
    // bindings
    this.handler = this.handler.bind(this)
  }
  
  clear() {
    this.pressed = []
    return this
  }
  
  
  capture(element) {
    this.element = element || document
    this.element.addEventListener("keydown", this.handler)
    this.element.addEventListener("keyup", this.handler)
    return this

  }
  
  release() {
    this.element.addEventListener("keydown", this.handler)
    this.element.addEventListener("keyup", this.handler)
    return this
  }
  
  
  
  handler(e) {
    
    this.pressed = []
    
    if (this.disabled) return this
    
    let pressed = e.type !== "keyup"
    let char = e.which
    let key = null
    
    // alphabetical keys are between 48 and 90
    if (char >= 48 && char <= 90) {
      key = String.fromCharCode(char).toLowerCase()
    }
    else {
      key = this.keyCodes[char]
    }
    
    this.keys[key] = pressed
    
    if (!this.defaultAllowed[key]) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    // add the pressed keys to our list of pressed keys
    for (let k in this.keys) {
      let value = this.keys[k]
      if (value === true) this.pressed.push(k)
    }
    
    return this
  }
  
  
  // helper method for checking if a set of keys have been pressed
  // Keyboard.command(["ctrl", "x"])
  // @param exact if the pressed keys should match exactly
  //    e.g. ["ctrl", "x"] is pressed, not ["ctrl", "shift", "x"]
  command(keys, exact = false) {
    
    // short-circuit check for exact
    if (exact && (keys.length !== this.pressed.length)) {
      return false
    }
    
    // check if all of our keys are pressed
    // short-circuits on failure
    for (let i = 0, ii = keys.length; i < ii; i++) {
      if (this.keys[keys[i]]) continue
      else return false
    }
    
    return true
  }
  
  any(keys) {
    return this.identity(keys, true)
  }
  
  not(keys) {
    return this.identity(keys, false)
  }
  
  only(keys) {
    return this.command(keys, true)
  }
  
  identity(keys, result) {
    for (let i = 0, ii = keys.length; i < ii; i++) {
      if (this.keys[keys[i]]) return result
    }
    return !result
  }
  
  
}

export default new Keyboard()