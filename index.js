
import EventEmitter from "./events"
import Renderer from "./renderer"
import { defer } from "./utils"

export default class Suki {
  
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
          that.events.trigger("ready")
        })
        return true
      }
      else return false
    }
    
    if (!isReadyCheck()) {
      document.onreadystatechange = isReadyCheck
    }
    
  }
  
  ready(fn) {
    if (this.isReady) fn()
    else this.events.on("ready", fn)
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
    
    console.log(`Stepping every ${fpms}ms, ${fps} frames per second`)
    
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
        window.cancelAnimationFrame(time.id)
        return
      }
      
      that.events.trigger("tick", time)
      
      // update time object with the new time and deltas
      _now = now()
      
      time.now = _now
      time.delta = (_now - time.lastCalled)
      time.elapsed += time.delta
      
      // perform a step
      that.events.trigger("step", time)
      
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
        that.events.trigger("pre-render", time, that.renderer, that)
        that.events.trigger("render", time, that.renderer, that)
        time.lastCalled = _now
        that.events.trigger("post-render", time, that.renderer, that)
      }
      
      time.id = window.requestAnimationFrame(tick)
    }
    
    // we ride
    time.id = window.requestAnimationFrame(tick)
    
    return this
  }
  
  stop() {
    this.running = false
  }
  
  App(superclass = {}) {
    
    // sometimes, you just have to admire how beautiful closures are  
    const suki = this
    
    return class SukiAttachedApp extends superclass {
      
      constructor() {
        super()
      }
      
      mount() {
        
        if (this.tick)        suki.on("tick",         this.tick)
        if (this.step)        suki.on("step",         this.step)
        if (this.preRender)   suki.on("pre-render",   this.preRender)
        if (this.render)      suki.on("render",       this.render)
        if (this.postRender)  suki.on("post-render",  this.postRender)
      }
      
      unmount() {
        if (this.tick)        suki.off("tick",         this.tick)
        if (this.step)        suki.off("step",         this.step)
        if (this.preRender)   suki.off("pre-render",   this.preRender)
        if (this.render)      suki.off("render",       this.render)
        if (this.postRender)  suki.off("post-render",  this.postRender)
      }
      
    }
  }
}

