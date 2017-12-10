import { SubSystem } from "./index"

export class StateManager {
  
  constructor(suki) {
    this.states = {}
    this.ref = null 
    this.current = null
    if (suki) this.current = suki
  }
  
  add(state) {
    let name = state.name
    this.states[name] = state
  }
  
  
  setState(state) {
    this.add(state)
    this.change(state.name)
  }
  
  
  changeByRef(state) {
    this.change(state.name)
  }
  
  async change(name) {
    
    let state = this.states[name] || null
    
    if (state !== null) {
       
      // leave previous state
      if (this.current !== null) {
        this.current.unmount()
        this.current.leave()
      }
      
      // change to the new state
      this.current = state
      
      // first time in this state? perform setup:
      if (!state.ready) {
        // load async things via load()
        if (state.isAsync) await this.current.load(state)
        state.ready = true
        state.init()
      }
      
      state.enter()
      state.mount(this.ref)
    }
  }
}

export const gamestate = new StateManager()


export class State extends SubSystem() {
  
  constructor(state) {
    super()
    this.isAsync = false
    this.ready = false
    
    if (!state.name) throw new Error("A name is required for a State")
    
    for (let key in state) {
      this[key] = state[key]
    }
  
  }
  
  enter(){}
  leave(){}
  init() {}
  
  // Needs to return a promise
  async load() {}
  
  tick() {}
  step() {}
  preRender() {}
  render() {}
  postRender() {}
  
}