import Suki from "../../index"
import { gamestate, State } from "../../state"
import { manager, Tween } from "../../tween"
import keyboard from "../../keyboard"
import World from "../../world"

/*
    In this example:
    we create a gamestate which renders a square on the 
    screen at the world origin (0, 0). 
    Then, we use keyboard keys to move the origin around.
  
    We additionally render the screen coordinates and the 
    world coordinates in a 4x4 grid
*/

let suki = new Suki()

manager.mount()
const world = new World(suki.renderer)
world.center()

// world.viewport(500, 500)
console.log(world)

const state = new State({
  
  name: "play-game",
  
  data: {
    message: "Use your keyboard to view everything",
  },
  
  enter: () => {
    // begin listening for events
    keyboard.capture()
  },
  
  render: (time, $, suki, data) => {
      
    $.clear("#fff")
      .fillStyle("#000")
      .font("15px Arial")
      // .fillText(data.message, 50, 50)
    
    
    $.fillStyle("#ccc")
    world.fillRect(0, 0, 100, 100)
    $.fillStyle("#000")
    world.fillText(`Origin 0, 0`, 0, 0)
    
    if (keyboard.pressed[0] == "left")  world.move(-10, 0)
    if (keyboard.pressed[0] == "right") world.move(10, 0)
    if (keyboard.pressed[0] == "up")    world.move(0, 10)
    if (keyboard.pressed[0] == "down")    world.move(0, -10)
    
    let xSize = window.innerWidth / 4
    let ySize = window.innerHeight / 4
    for (let x = 0, xx = 4; x < xx; x++) {
      for (let y = 0, yy = 4; y < yy; y++) {
        let _x = x * xSize 
        let _y = y * ySize
        let [ worldX, worldY ] = world.calc(_x, _y)
        
        $.fillStyle("#a66").fillText(`screen: ${_x}, ${_y}`, _x, _y)
        $.fillStyle("#66a").fillText(`world: ${worldX}, ${worldY}`, _x, _y + 20)
      }
    }
  
    
    // draw the horizontal axis line

    // allow window reloading
    if (keyboard.command(["ctrl", "r"], true)) {
      window.location.reload()
    }
    
  }
  
})


gamestate.add(state)
gamestate.change(state.name)





console.log(suki)
suki.whenReady(() => {
  console.log("ready!")
  suki.start()
})