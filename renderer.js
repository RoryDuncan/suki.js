
import Context from './context'

export class Renderer extends Context {
  
  constructor() {
    super();
    let canvas = document.createElement("canvas")

    this.canvas = canvas
    this.context = canvas.getContext("2d")
  }
  
  // Adds the canvas to the target element
  // defaults to the body
  addCanvasToDOM(target = document.body) {
    
    if (!target.appendChild) {
      throw new Error("Renderer.addCanvasToDOM did not recieve a DOM node")
    }
    
    this.canvas.id = "renderer"
    target.appendChild(this.canvas)
    return this;
  }
  
  // Creates a triangle path 
  triangle(point1, point2, point3) {
    
    if (arguments.length < 3) {
      throw new Error("Renderer.triangle has less than three arguments.")
    }
    
    this.beginPath()
    this.moveTo(point1.x, point1.y)
    this.lineTo(point2.x, point2.y)
    this.lineTo(point3.x, point3.y)
    this.closePath();
    return this;
  }
  
  
  strs(...args) {
    this.save()
    return this.trs.call(this, ...args)
  }
  
  trs(x = 0, y = 0, rotation = 0, scale = 1) {
    this.translate(x, y)
      .rotate(rotation)
      .scale(scale, scale);
    return this;
  }
  
  // Saves, executes all parameter functions, then restores
  do(...actions) {
    this.save();
    actions.forEach(action => action())
    this.restore();
    return this;
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
  
}