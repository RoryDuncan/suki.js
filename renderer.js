
import Context from './context'

export class Renderer extends Context {
  
  constructor() {
    super();
    let canvas = document.createElement("canvas")

    this.canvas = canvas
    this.context = canvas.getContext("2d")
    
  }
  
  addCanvasToDOM(target = document.body) {
    
    if (!target.appendChild) {
      throw new TypeError("Renderer.addCanvasToDOM did not recieve a DOM node")
    }
    
    this.canvas.id = "renderer"
    target.appendChild(this.canvas)
    return this;
  }
}