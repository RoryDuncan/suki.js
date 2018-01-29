

/*
  
    World is a wrapper for a renderer in combination with a data representation 
    of orientation, origin, and offset. Those representations are then used to 
    calculate positions, then provided to the methods of the renderer.
     
    It could also be considered analagous to a camera, since it has a view
    but translations for screenshake and such should not be done on it.
    
    
     
*/


// WorldRenderer contains the methods used on the canvas context (the renderer).

export class WorldRenderer {
  
  constructor(renderer) {
    if (!renderer) throw new Error("WorldRender requires a renderer as first argument")
    this.renderer = this.$ = renderer
  }
  
  static calculate(world, x, y) {
    
    let offset = world.offset
    let origin = world.origin
    
    let _x = Math.round(origin.x + offset.x + x)
    let _y = Math.round(origin.y + offset.y + y)
    
    return [_x, _y]
  }
  
  
  // Canvas API Methods
  // refer to MDN for their parameters
  
  translate(x = 0, y = 0) {
    this.$.apply(this.$, this.calculate(x, y))
    return this
  }
  
  fillRect(x, y, w, h) {
    let [ calcX, calcY ] = this.calculate(x, y)
    this.$.fillRect(calcX, calcY, w, h)
    return this
  }
  
  strokeRect(x, y, w, h) {
    let [ calcX, calcY ] = this.calculate(x, y)
    this.$.strokeRect(calcX, calcY, w, h)
    return this
  }
  
  moveTo(x, y) {
    this.$.moveTo.apply(this.$, this.calculate(x, y))
    return this
  }
  
  lineTo(x, y) {
    this.$.moveTo.apply(this.$, this.calculate(x, y))
    return this
  }
  
  quadraticCurveTo(cpx, cpy, x, y) {
    
    let [ _cpx, _cpy ]  = this.calculate(cpx, cpy)
    let [ _x, _y ]      = this.calculate(x, y)
    
    this.$.quadraticCurveTo(_cpx, _cpy, _x, _y)
    return this
  }
  
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    
    let [ _cp1x, _cp1y ] = this.calculate(cp1x, cp1y)
    let [ _cp2x, _cp2y ] = this.calculate(cp2x, cp2y)
    let [ _x, _y]        = this.calculate(x, y)
    
    this.$.bezierCurveTo(_cp1x, _cp1y, _cp2x, _cp2y, _x, _y)
    return this
  }
  
  arcTo(x1, y1, x2, y2, radius) {
    
    let [ startX, startY ]  = this.calculate(x1, y1)
    let [ endX, endY ]      = this.calculate(x2, y2)
    
    this.$.arcTo(startX, startY, endX, endY, radius)
    return this
  }
  
  rect(x, y, w, h) {
    
    let [ calcX, calcY ] = this.calculate(x, y)
    this.$.rect(calcX, calcY, w, h)
    
    return this
  }
  
  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    
    let [ _x, _y ] = this.calculate(x, y)
    this.$.arc(_x, _y, radius, startAngle, endAngle, anticlockwise)
    
    return this
    
  }
  
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    
    let [ _x, _y ] = this.calculate(x, y)
    
    this.$.ellipse(_x, _y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
    return this
  }
  
  // signature
  //    ImageData ctx.getImageData(sx, sy, sw, sh);
  getImageData(sx, sy, sw, sh) {
    let [ x, y ] = this.calculate(sx, sy) 
    let imageData = this.$.getImageData(x, y, sw, sh)
    return imageData
  }
  
  // signatures:
  //    void ctx.putImageData(imagedata, dx, dy);
  //    void ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
  putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    
    let [ x, y ] = this.calculate(dx, dy)
    
    this.$.putImageData(imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
    return this
  }
  
  // signatures:
  //    void ctx.drawImage(image, dx, dy);
  //    void ctx.drawImage(image, dx, dy, dWidth, dHeight);
  //    void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  drawImage(image) {
    
    if (arguments.length === 9) {
      let [ x, y, ] = this.calculate(arguments[5], arguments[6])
      arguments[5] = x
      arguments[6] = y
      this.$.drawImage.apply(this.$, arguments)
    }
    else {
      let [ x, y, ] = this.calculate(arguments[3], arguments[4])
      arguments[3] = x
      arguments[4] = y
      this.$.drawImage.apply(this.$, arguments)
    }
    
    return this
  }
}


export default class World extends WorldRenderer {
  
  constructor(renderer) {
    
    // super( ... )  will throw for us if renderer is not defined
    super(renderer)
    
    // determines the directions that positive and negative are
    this.axis = {
      x: 1,
      y: 1,
    }
    
    // a reference for where the offset vector should be calculated from
    this.origin = {
      x: 0,
      y: 0,
    }
    
    // the current directional vector
    this.offset = {
      x: 0,
      y: 0,
    }
    
    // the rendered rectangle of the world
    this.view = {
      x: 0,
      y: 0,
      z: 0,
      width: renderer.width,
      height: renderer.height,
    }
  }
  
  // set the current view's width and height
  // resizes the canvas
  viewport(width, height, resizeRenderer = true) {
    this.view.width = width
    this.view.height = height
    if (resizeRenderer) this.renderer.resize(width, height)
    
    this.origin.x = Math.round( width * 0.5 )
    this.origin.y = Math.round( height * 0.5 )
  }
  
  // Sets the current view to the x and y parameters
  // to only set x, pass null for y, and vice versa
  // Note on naming: we can't name it moveTo, since the context method moveTo exists
  set(x, y) {
    
    if (typeof x == "number") {
      this.offset.x = this.origin.x - x
      this.view.x = this.origin.x + x
    }
    
    if (typeof y == "number") {
      this.offset.y = this.origin.y - y
      this.view.y = this.origin.y + y
    }
    
    return this
  }
  
  // sets the current view relative to where it's currently at
  // pass only an x or a y to move one axis
  move(x = 0, y = 0) {
    
    let xMagnitude = x * this.orientation.x
    let yMagnitude = y * this.orientation.y
    
    this.view.x += xMagnitude
    this.view.y += yMagnitude
    
    this.offset.x -= xMagnitude
    this.offset.y -= yMagnitude
    
  }
  
}