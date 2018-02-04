import { suki } from "../../index"
import { gamestate, State } from "../../state"
import { manager, Tween } from "../../tween"
import keyboard from "../../keyboard"

/*
    In this example:
    we create a gamestate which renders a square on the screen
    We then use the keyboard to move it's position around
    Additionally, we print out all keys that have been pressed
*/

manager.mount()

const state = new State({
  
  name: "play-game",
  
  data: {
    message: "Press buttons on your keyboard!",
    square: {
      x: 150,
      y: 150,
      color: "#fff",
    },
  },
  
  enter: () => {
    // begin listening for events
    keyboard.capture()
  },
  
  render: (time, $, suki, data) => {
      
    $.clear("#077")
      .fillStyle("#fff")
      .font("15px Arial")
      .fillText(data.message, 50, 50)
      .fillText(`${suki.stats.fps().toFixed(0)} fps`, window.innerWidth - 50, 25)
      .fillStyle("#fff")
      .font("80px Arial")
      // print our all pressed keys
      .fillText(keyboard.pressed.join(" + "), window.innerWidth / 2, 250)
    
    // move the square in the direction
    // a more robust solution would accomodate for multiple directions and such
    let speedPerTick = 5
    switch (keyboard.pressed[0]) {
      case "left":  data.square.x -= speedPerTick; break;
      case "right": data.square.x += speedPerTick; break;
      case "up":    data.square.y -= speedPerTick; break;
      case "down":  data.square.y += speedPerTick; break;
    }
    
    $.fillStyle(data.square.color).fillRect(data.square.x, data.square.y, 10, 10)
      
      
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