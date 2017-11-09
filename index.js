
import EventEmitter from "./events"
import Renderer from "./renderer"
import { defer } from "./utils"

export default class Suki {
  
  constructor(options) {
    
    const that    = this
    this.running  = false
    this.isReady  = false
    this.events   = new EventEmitter()
    this.renderer = new Renderer()
    this.$        = this.renderer
    this.canvas   = this.renderer.canvas
    
    this.renderer.addCanvasToDOM()
    
    let triggerReady = defer(() => {
      that.isReady = true
      that.events.trigger("ready")
      return true
    })
    
    let isReady = () => document.readyState == "complete" ? triggerReady() : false
    if (!isReady()) document.onreadystatechange = () => isReady()
  }
  
  start() {
    
    this.running = true
    const that = this
    const now = () => Date.now()
    const start = now()
    
    // prepare our frameskipping mechanisms
    const frameSkipping = {
      skippedFrames: 0,
      enabled: true,
      threshold: 120,
    }
    
    const frameSkippingThreshold = frameSkipping.threshold
    const skipFrame = (frameSkipping.enabled ? dt => dt > frameSkippingThreshold : dt => false )
    
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
    }
    
    this.time = () => time
    
    // everything in this function is extremely time-sensitive
    // but, it's also where all the magic happens
    const step = e => {
      if (that.running) {
        window.cancelAnimationFrame(time.id)
        return
      }
      
      let _now = now()
      
      time.now = _now
      time.delta = (_now - time.lastCalled)
      time.elapsed += time.delta
      that.events.trigger("step", time)
      
      if (skipFrame(time.delta)) {
        that.stats.skippedFrames += 1
        time.elapsed -= time.delta
      }
      else {
        that.events.trigger("pre-render", time, that.renderer, that)
        that.events.trigger("render", time, that.renderer, that)
      }
      
      time.lastcalled = _now
      that.events.trigger("post-render", time, that.renderer, that)
      time.id = window.requestAnimationFrame(step)
      
      return that
    }
    
    // we ride
    time.id = window.requestAnimationFrame(step)
    
    return this
  }
  
}

