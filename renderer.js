/* global CanvasRenderingContext2D */
import Context from './context'

export default class Renderer extends Context {
  
  constructor(width, height, scale = 1, smoothing = false) {
    super(width, height)
    this.isOffscreenCanvas = true
    this.imageSmoothingEnabled(smoothing)
  }
  
  // Adds the canvas to the target element
  // defaults to the body
  addCanvasToDOM(target = document.body) {
    
    if (!target.appendChild) {
      throw new Error("Renderer.addCanvasToDOM did not recieve a DOM node")
    }
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.canvas.id = "renderer"
    this.isOffscreenCanvas = false
    target.appendChild(this.canvas)
    return this
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
    this.closePath()
    return this
  }
  
  strs(...args) {
    this.save()
    return this.trs.call(this, ...args)
  }
  
  trs(x = 0, y = 0, rotation = 0, scale = 1) {
    this.translate(x, y)
      .rotate(rotation)
      .scale(scale, scale)
    return this
  }
  
  // Saves, executes all parameter functions, then restores
  do(...actions) {
    this.save()
    actions.forEach(action => action())
    this.restore()
    return this
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
  
  dimensions() {
    
    let width = this.canvas.width
    let height = this.canvas.height
    return {x: 0, y: 0, width, height}
  }
  
  cache() {
    let {x, y, width, height} = this.dimensions()
    return this.getImageData(x, y, width, height)
  }
  
  resize(w, h) {
    
    let data = this.cache()
    this.canvas.width = w
    this.canvas.height = h
    this.putImageData(data, 0, 0, w, h)
    return this
  }
  
  draw(target, x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    
    // only allows drawing on Renderer instances
    if (!(target instanceof Renderer)) {
      throw new TypeError("Incorrect argument type. Should be Renderer")
    }
    
    let source = this.dimensions()
    
    let data = this.getImageData(source.x, source.y, source.width, source.height)
    this.putImageData(data, x, y, width, height)
    
  }
  
}