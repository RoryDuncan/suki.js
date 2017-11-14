import Suki from "../index"

let suki = new Suki()

console.log(suki)

  /*
    In the class below we're extendedin suki.App().
    
    This returns a prototype with .mount(), and .unmount() methods, 
    which add listeners for the following lifecycle events of your suki app:
    
    tick, step, preRender, render, and postRender
  
  */
class Thing extends suki.App() {
  
  
  render(time, renderer, ref) {
    let text = "Hello from Thing Class. This is being called from an instance of Thing.render."
    renderer
      .clear()
      .fillStyle("#000")
      .fillText(text, 200, 200)
  }
}

suki.whenReady(() => {
  let thing = new Thing()
  thing.mount()
  console.log(thing)
  console.log("ready!")
  suki.start()
})


