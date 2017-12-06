import SubSystem from "./index"

export class StateManager {
  
  constructor(suki){
    this.states = {}
    this.suki = suki || null
  }
  
  
  add(name, state) {
    let name = state.name
    this.states[name] = state
  }
  
  
  async setState(name, state) {
    this.add(name, state);
    this.change(name);
  }
  
  
  async change(name) {
    
    let state = this.states[name]
    
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
      state.mount(this.suki)
    }
  }
  
  
  get current() {
    return this.current || null
  }
  
  set current(value) {
    this.current = value
  }
  
}



export default class State extends SubSystem() {
  
  constructor(name, isAsync = false) {
    
    if (!name) throw new Error("A name is required for a State");
    this.name = name
    this.isAsync = isAsync
    this.ready = false
    this.store = null
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