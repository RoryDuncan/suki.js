'use strict';

const errorMessage = (method, item) => `EventEmitter.${method} is missing ${item}.`;
const isNullOrUndefined = (val) => val == null || typeof val == "undefined";

class EventEmitter {
  
  constructor() {
   this._events = {};
   this._allowed = {};
   
   this.addEventListener = this.on;
   this.removeEventListener = this.off;
  }
  
  on(event, fn, data) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("on", "an event name"))
    if (isNullOrUndefined(fn)) throw new Error(errorMessage("on", "a callback function"))
    
    this._events[event] = this._events[event] || [];
    this._events[event].push({ event, fn, data});
    
    // if an event is disabled, we keep it disabled, otherwise we default to enabled
    if (isNullOrUndefined(this._allowed[event])) this._allowed[event] = true;
    
    return this;
  }
  
  off(event, fn) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("off", "an event name"))
    
    // remove all events if a specific callback is not provided
    if (isNullOrUndefined(fn)) {
      this._events[event] = [];
      delete this._allowed[event];
    }
    else {
      let events = this._events[event] || [];
      this._events[event] = events.filter(el => el.fn != fn);
    }
    
    return this;
  }
  
  trigger(event, ...data) {
    
    if (isNullOrUndefined(event)) throw new Error(errorMessage("trigger", "an event name"))
    
    if (this._allowed[event] === false) return this;
    
    let events = this._events[event] || [];
    events.forEach(e => e.fn(...data));
    
    return this;
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

const valueReturningMethods = [
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
];

let chainMethod = function(wrapper, fn, isGetter) {
  if (isGetter) {
    return (...args) => fn.apply(wrapper.context, ...args)
  }
  else return (...args) => {
    fn.apply(wrapper.context, ...args); 
    return wrapper
  }
};

// chains a property as a function
// ->   ctx.text(value) instead of ctx.text = value
let chainProperty = function(wrapper, key) {
  return (value) => {
    if (typeof value == "undefined") {
      return wrapper.context[key]
    }
    wrapper.context[key] = value;
    return wrapper
  }
};

// not defined as a class because we programmatically create the prototype below.
class Context {
  
  constructor() {
    
    this.canvas = document.createElement("canvas");
    let context = this.context = this.canvas.getContext("2d");
  
    // extend the canvas's context
    // for-in iterates over prototype methods, as well
    for (let key in context) {
      let value = context[key];
      let isGetter = false;
      
      // detect if it's a method or a property
      if (typeof value == "function") {
        
        if (valueReturningMethods.includes(key)) {
          isGetter = true;
        }
        
        this[key] = chainMethod(this, value, isGetter);
      }
      else if (key != "canvas") {
        this[key] = chainProperty(this, key);
      }
    }
  }
}

/* global CanvasRenderingContext2D */
class Renderer extends Context {
  
  constructor() {
    super();
    this.isOffscreenCanvas = true;
    this.imageSmoothingEnabled(false);
  }
  
  // Adds the canvas to the target element
  // defaults to the body
  addCanvasToDOM(target = document.body) {
    
    if (!target.appendChild) {
      throw new Error("Renderer.addCanvasToDOM did not recieve a DOM node")
    }
    
    this.canvas.id = "renderer";
    this.isOffscreenCanvas = false;
    target.appendChild(this.canvas);
    return this
  }
  
  // Creates a triangle path 
  triangle(point1, point2, point3) {
    
    if (arguments.length < 3) {
      throw new Error("Renderer.triangle has less than three arguments.")
    }
    
    this.beginPath();
    this.moveTo(point1.x, point1.y);
    this.lineTo(point2.x, point2.y);
    this.lineTo(point3.x, point3.y);
    this.closePath();
    return this
  }
  
  strs(...args) {
    this.save();
    return this.trs.call(this, ...args)
  }
  
  trs(x = 0, y = 0, rotation = 0, scale = 1) {
    this.translate(x, y)
      .rotate(rotation)
      .scale(scale, scale);
    return this
  }
  
  // Saves, executes all parameter functions, then restores
  do(...actions) {
    this.save();
    actions.forEach(action => action());
    this.restore();
    return this
  } 
  
  clear(color = "#fff") {
    return this.fillStyle(color).fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  fillWith(color = "#000") {
    return this.fillStyle(color).fill()
  }
  
  fillWith(color = "#000") {
    return this.strokeStyle(color).stroke()
  }
  
  dimensions() {
    
    let width = this.canvas.width;
    let height = this.canvas.height;
    return {x: 0, y: 0, width, height}
  }
  
  cache() {
    let {x, y, width, height} = this.dimensions();
    return this.getImageData(x, y, width, height)
  }
  
  resize(w, h) {
    
    let data = this.cache();
    this.canvas.width = w;
    this.canvas.height = h;
    this.putImageData(data, 0, 0, w ,h);
    return this
  }
  
  draw(target, x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    
    // only allows drawing on Renderer instances
    if (!(target instanceof Renderer)) {
      throw new TypeError("Incorrect argument type. Should be Renderer")
    }
    
    let source = this.dimensions();
    
    let data = this.getImageData(source.x, source.y, source.width, source.height);
    this.putImageData(data, x, y, width, height);
    
  }
  
}

const defer = (fn) => window.setTimeout(fn, 0);

class Suki {
  
  constructor() {
    
    const that    = this;
    this.running  = false;
    this.isReady  = false;
    this.events   = new EventEmitter();
    this.renderer = new Renderer();
    this.$        = this.renderer;
    this.canvas   = this.renderer.canvas;
    
    this.renderer.addCanvasToDOM();
    
    // add our hook for watching for if the document is ready
    let isReadyCheck = () => {
      if (document.readyState == "complete") {
        defer(() => {
          that.isReady = true;
          that.events.trigger("ready");
        });
        return true
      }
      else return false
    };
    
    if (!isReadyCheck()) {
      document.onreadystatechange = isReadyCheck;
    }
    
  }
  
  ready(fn) {
    if (this.isReady) fn();
    else this.events.on("ready", fn);
    return this
  }
  
  start() {
    
    this.running = true;
    const that = this;
    const now = () => Date.now();
    const start = now();
    
    // prepare our frameskipping mechanisms
    const frameSkipping = {
      skippedFrames: 0,
      enabled: true,
      threshold: 120,
    };
    
    const frameSkippingThreshold = frameSkipping.threshold;
    const skipFrame = (frameSkipping.enabled ? dt => dt > frameSkippingThreshold : dt => false );
    
    // our time reference, provided to all renders and steps
    // using a constant reference helps V8 create an optimized class early.
    const time = {
      elapsed:    0,
      lastCalled: start,
      now:        start,
      start:      start,
      ticks:      0,
      delta:      null,
      id:         null,
    };
    
    this.time = () => time;
    
    // everything in this function is extremely performance-sensitive
    // but, it's also where all the magic happens
    const step = e => {
      if (that.running) {
        window.cancelAnimationFrame(time.id);
        return
      }
      
      time.ticks += 1;
      
      let _now = now();
      
      time.now = _now;
      time.delta = (_now - time.lastCalled);
      time.elapsed += time.delta;
      that.events.trigger("step", time);
      
      if (skipFrame(time.delta)) {
        that.stats.skippedFrames += 1;
        time.elapsed -= time.delta;
      }
      else {
        that.events.trigger("pre-render", time, that.renderer, that);
        that.events.trigger("render", time, that.renderer, that);
      }
      
      time.lastcalled = _now;
      that.events.trigger("post-render", time, that.renderer, that);
      time.id = window.requestAnimationFrame(step);
      
      return that
    };
    
    // we ride
    time.id = window.requestAnimationFrame(step);
    
    return this
  }
  
}

let suki = new Suki();

console.log(suki);
suki.ready(() => console.log("ready!"));
// suki.start()
