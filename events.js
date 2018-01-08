
const errorMessage = (method, item) => `EventEmitter.${method} is missing ${item}.`
const isNullOrUndefined = (val) => val == null || typeof val == "undefined"

export default class EventEmitter {
  
  constructor() {
   this._events = {}
   this._allowed = {}
   
   this.addEventListener = this.on;
   this.removeEventListener = this.off;
  }
  
  on(event, fn, data) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("on", "an event name"))
    if (isNullOrUndefined(fn)) throw new Error(errorMessage("on", "a callback function"))
    
    this._events[event] = this._events[event] || []
    this._events[event].push({ event, fn, data})
    
    // if an event is disabled, we keep it disabled, otherwise we default to enabled
    if (isNullOrUndefined(this._allowed[event])) this._allowed[event] = true
    
    return this;
  }
  
  off(event, fn) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("off", "an event name"))
    
    // remove all events if a specific callback is not provided
    if (isNullOrUndefined(fn)) {
      this._events[event] = []
      delete this._allowed[event]
    }
    else {
      let events = this._events[event] || [];
      this._events[event] = events.filter(el => el.fn != fn)
    }
    
    return this;
  }
  
  trigger(event, ...data) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("trigger", "an event name"))
    
    if (this._allowed[event] === false) return this;
    
    let events = this._events[event] || [];
    events.forEach((e) => e.fn(...data, e.data || null))
    
    return this;
  }
  
  once(event, fn, data) {
    
    let _fn = (...data) => {
      this.off(event, _fn)
      fn(...data, data || null)
    }
    
    this.on(event, _fn, data)
  }
  
  enable(event) {
    this._allowed[event] = true;
    return this;
  }
  
  disable(event) {
    this._allowed[event] = false;
    return this;
  }
}