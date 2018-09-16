
import EventEmitter from "./events"
import Renderer from "./renderer"
import { defer } from "./utils"

export const events = {
  READY: "ready",
  START: "start",
  STOP: "stop",
  TICK: "tick",
  STEP: "step",
  PRERENDER: "pre-render",
  RENDER: "render",
  POSTRENDER: "post-render",
}

/* 
    Suki
    
    connects our primary renderer, an event emitter, a game loop, and such
*/
class Suki {
  
  constructor() {
    
    const that    = this
    this.running  = false
    this.isReady  = false
    this.events   = new EventEmitter()
    this.renderer = new Renderer()
    this.$        = this.renderer
    this.canvas   = this.renderer.canvas
    this.stats    = {
      skippedFrames: 0,
      fps: () => {
        return 1000/that.time().lastRenderDelta
      },
    }
    this.renderer.addCanvasToDOM()
    
    // add our hook for watching for if the document is ready
    let isReadyCheck = () => {
      if (document.readyState == "complete") {
        defer(() => {
          that.isReady = true
          that.events.trigger(events.READY)
        })
        return true
      }
      else return false
    }
    
    if (!isReadyCheck()) {
      document.onreadystatechange = isReadyCheck
    }
  }
  
  whenReady(fn) {
    if (this.isReady) fn()
    else this.events.on(events.READY, fn)
    return this
  }
  
  time() {
    return null
  }
  
  start(fps = 60) {
    
    // note that fps is constrained by the browser,
    // thus it may be more apt to call it a 'render interval'
    // that said, it does still determine the frameskip threshold,
    let fpms = 1000/fps
    
    console.log(`Stepping every ${fpms.toFixed(2)}ms, ${fps} frames per second`)
    this.events.trigger(events.START, this.renderer, this)
    this.running = true
    
    const that = this
    const now = () => Date.now()
    const start = now()
    
    // if a step takes longer than this we skip the frame
    //    At 60FPS, this would be 12.5ms to process a 'step'
    const frameskipDeltaThreshold = fpms * 0.8
    
    // our time reference, provided to all renders and steps
    // using a constant reference helps V8's JITC create an optimized class early.
    const time = {
      id:               null,
      now:              start,
      start:            start,
      ticks:            0,
      delta:            null,
      elapsed:          0,
      lastCalled:       start,
      stepDuration:     0,
      lastRenderDelta:  0,
    }
    
    
    let _now = 0
    let lastRender = start
    
    this.time = () => time
    
    // everything in this function is extremely performance-sensitive
    // but, it's also where all the magic happens
    const tick = e => {
      
      time.ticks += 1
      
      if (!that.running) {
        if (time.id != null) window.cancelAnimationFrame(time.id)
        time.id = null
        return
      }
      
      that.events.trigger(events.TICK, time)
      
      // update time object with the new time and deltas
      _now = now()
      
      time.now = _now
      time.delta = (_now - time.lastCalled)
      time.elapsed += time.delta
      
      // perform a step
      that.events.trigger(events.STEP, time)
      
      // after a step we measure the time it took to determine if too much processing 
      // occurred for an immediate render, a la, frame sklpping
      _now = now()
      time.stepDuration = _now - time.now
      time.lastRenderDelta = _now - lastRender
      
      if (time.stepDuration > frameskipDeltaThreshold) {
        
        that.stats.skippedFrames += 1
        time.elapsed -= time.delta
        time.lastCalled = _now
      }
      else {
        
        lastRender = _now
        that.events.trigger(events.PRERENDER, time, that.renderer, that)
        that.events.trigger(events.RENDER, time, that.renderer, that)
        time.lastCalled = _now
        that.events.trigger(events.POSTRENDER, time, that.renderer, that)
      }
      
      time.id = window.requestAnimationFrame(tick)
    }
    
    // we ride
    time.id = window.requestAnimationFrame(tick)
    
    return this
  }
  
  stop() {
    this.running = false
    this.events.trigger(events.STOP, this.renderer, this)
  }
  
}


/*
   Amazing things seem to be happening!  
*/
export const suki = new Suki()

/*
    Subsystem

    Subsystems are how we create modules that hook into the game loop
*/
export const SubSystem = (superclass = Object) =>  class SukiAttachedApp extends superclass {
  
  constructor() {
    super()
    this.data = null
  }
  
  mount() {
    if (this.tick)        suki.events.on(events.TICK,         this.tick,         this.data)
    if (this.step)        suki.events.on(events.STEP,         this.step,         this.data)
    if (this.preRender)   suki.events.on(events.PRERENDER,    this.preRender,    this.data)
    if (this.render)      suki.events.on(events.RENDER,       this.render,       this.data)
    if (this.postRender)  suki.events.on(events.POSTRENDER,   this.postRender,   this.data)
  }
  
  unmount() {
    
    if (this.tick)        suki.events.off(events.TICK,          this.tick,         this.data)
    if (this.step)        suki.events.off(events.STEP,          this.step,         this.data)
    if (this.preRender)   suki.events.off(events.PRERENDER,     this.preRender,    this.data)
    if (this.render)      suki.events.off(events.RENDER,        this.render,       this.data)
    if (this.postRender)  suki.events.off(events.POSTRENDER,    this.postRender,   this.data)
  }  
}
