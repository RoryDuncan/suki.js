import EventEmitter from "./events"
import { SubSystem } from "./index"
import ease from "./ease"
// todo: use easings to properly affect our modifier inside of Tween::step

const bounded = (value, min, max) => Math.min(max, Math.max(min, value))

// Tween Manager
export class TweenManager extends SubSystem() {
  
  constructor() {
    super()
    this.tweens = []
    this.ID = 0
    this.step = this.step.bind(this)
  }
  
  add(tween) {
    if (this.tweens.includes(tween)) return;
    tween.ID = this.ID
    this.ID++
    this.tweens.push(tween)
  }
  
  remove(tween) {
    let index = this.tweens.indexOf(tween)
    if (index >= 0) {
      this.tweens = this.tweens.filter(t => t.ID != tween.ID)
    }
  }
  
  step(time, $) {
    this.tweens.forEach(t => t.step.call(t, time, $))
  }
}


// the manager expected to normally interact with
export const manager = new TweenManager()

export class Tween extends EventEmitter {
  
  constructor(from, to) {
    super()
    
    this.animating  = false
    this.complete   = false
    
    this.data = {
      origin:   null, // the source object which is updated
      from:     null, // copy of source object
      to:       null, // the target object with values
    }
    
    this.time = {
      loop:     false,
      easing:   "linear",
      elapsed:  0,
      duration: 1,
    }
    
    this.changes = {}
    
    manager.add(this)
    
  }
  
  from(origin) {
    this.data.origin = origin
    if (!origin) console.error("Tween.from expects an argument.")
  }
  
  to(target) {
    this.data.to = target
    if (!target) console.error("Tween.to expects an argument.")
  }
  
  for(duration, easing = "linear") {
    this.time.duration = duration * 1000
    this.time.easing = easing
  }
  
  isReady() {
    return this.data.origin !== null && this.data.to !== null
  }
  
  start() {
    let isReady = this.isReady()
    if (isReady) {
      this.time.elapsed = 0
      
      let origin  = this.data.origin
      let from    = this.data.from 
                  = {}
      let to      = this.data.to
      
      for (let key in to) {
        
        // we copy the properties so that we have a snapshot of the 'before', or starting, state
        let start = from[key] = origin[key] || 0
        
        // change is a delta of the value found in both 'to', and 'from'
        this.changes[key] = to[key] - start
      } 
      
      this.animating = true
    }
    else {
      console.warn("Tween can't be started yet. Not enough data.")
    }
    return isReady
  }
  
  reset() {
    this.start()
  }
  
  step(time) {
    
    if (!this.animating) return
    
    this.time.elapsed += time.delta
    let progress = bounded(this.time.elapsed / this.time.duration, 0, 1)
    
    // todo: input 'progress' to our easing function
    let modifier = ease(this.time.easing, progress)
    let origin = this.data.origin
    
    // proceed through our animation / tween for each key
    for (let key in this.changes) {
      let before = this.data.from[key]
      let change = this.changes[key]
      
      origin[key] = before + (change * modifier)
    }
    
    // completion check
    if (progress >= 1) {
      
      if (this.time.loop) {
        this.elapsed = 0
      }
      else {
        this.animating = false
        this.complete = true
        this.trigger("complete")
      }
      
    }
  }
  
  stop() {
    this.animating = false
  }
  
  remove() {
    this.stop()
    manager.remove(this)
  }
  
}