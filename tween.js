import EventEmitter from "./events"
import { SubSystem } from "./index"
import { suki } from "./index"
import ease from "./ease"

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
manager.mount()

export class Tween extends EventEmitter {
  
  constructor() {
    super()
    
    this.loop       = false
    this.complete   = false
    this.animating  = false
    
    this.data = {
      // the current action's index
      index:    0,
      // the source / context. it is updated with real values on each step
      context:   null,
      // the list of target object with their values
      actions:  [],
    }
    
    manager.add(this)
  }
  
  from(context) {
    this.data.context = context || null
    return this
  }
  
  to(target, duration = 1, easing = "inOutQuad", elapsed = 0) {
    let tweenData = new TweenData(target, duration * 1000, easing, elapsed)
    this.data.actions.push(tweenData)
    return this
  }
  
  isReady() {
    return this.data.context !== null && this.data.actions.length != 0
  }
  
  start() {
    
    if (!this.isReady()) {
      console.warn("Tween can't be started yet. Not enough data.")
      return false
    }
      this.data.index = -1
      this.complete   = false
      this.next()
      this.animating  = true
    
    return this
  }
  
  next() {
    
    this.data.index++
    
    if (this.data.actions.length == this.data.index) {
      this.animating  = false
      this.complete   = true
      this.trigger("complete")
    }
    else {
      let action = this.data.actions[this.data.index]
      action.prepare(this.data.context)
    }
  }
  
  reset() {
    this.start()
    return this
  }
  
  step(time) {
    
    if (!this.animating) return
    
    let action = this.data.actions[this.data.index]
    
    action.elapsed += time.delta
    
    let progress  = bounded(action.elapsed / action.duration, 0, 1)
    let modifier  = ease(action.easing, progress)
    let context   = this.data.context
    
    // proceed through our animation / tween for each key
    // calculating the change occuring in that step
    for (let key in action.changes) {
      
      let before = action.from[key]
      let change = action.changes[key]
      
      context[key] = before + (change * modifier)
    }
    
    // completion check
    if (progress >= 1 && !this.complete) {
      
      this.trigger("action-complete")
      
      if (this.loop) {
        action.elapsed = 0
      }
      else {
        this.next()
      }
    }
  }
  
  stop() {
    this.animating = false
    return this
  }
  
  resume() {
    this.animating = true
    return this
  }
  
  clear() {
    this.complete     = false
    this.animating    = false
    this.data.index   = 0
    this.data.actions = []
    return this
  }
  
  remove() {
    this.clear()
    manager.remove(this)
    return this
  }
}

export class TweenData {
  
  constructor(to, duration, easing, elapsed) {
    
    this.to       = to
    this.duration = duration
    this.easing   = easing
    this.elapsed  = elapsed
    this.from     = null
    this.changes  = null
  }
  
  prepare(context) {
    
    if (this.from != null && this.changes != null) return;
    
    this.from     = {}
    this.changes  = {}
    
    for (let key in this.to) {
      
      let start = this.from[key] = context[key] || 0
      
      // change is a delta of the value found in both 'to', and 'from'
      this.changes[key] = this.to[key] - start
    }
    return this;
  }
}