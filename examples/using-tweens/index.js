import Suki from "../../index"
import { gamestate, State } from "../../state"
import { manager, Tween } from "../../tween"

/*
    In this example:
    we create a gamestate which renders a square on the screen
    we then use click events to create a tween that moves the square to the click location
*/


let suki = new Suki()

manager.mount()

// create a title screen state
// when inside the title screen state, we render the menu items

let square = {
  x: 50,
  y: 50,
  w: 50,
  h: 50,
}

const state = new State({
  
  name: "play-game",
  
  data: {
    message: "Click to move the square via a tween",
    tween: null,
  },
  
  render: (time, $, suki, data) => {
      
    $.clear("#707")
      .fillStyle("#fff")
      .font("15px Arial")
      .fillText(data.message, 100, 150)
      .fillStyle("#fff")
      .fillRect(square.x, square.y, square.w, square.h)
  }
})


gamestate.add(state)
gamestate.change(state.name)

document.addEventListener("click", (e) => {
  
  let [x, y] = [e.x - 25, e.y - 25]
  let tween = gamestate.tween
  
  // we re-use a single tween instance for this example
  if (tween == null) {
    tween = new Tween()
  }
  
  // stop the tween's state
  tween.stop()
  
  // set it's origin again
  tween.from(square)
  
  // set the new target location to be the click
  tween.to({x, y, w: 20, h: 20 })
  tween.for(1, "outBounce")
  tween.start()
  
  // an additional little pop!
  tween.once("complete", () => {
    tween.stop()
    tween.from(square)
    tween.to({ w: 50, h: 50, })
    tween.for(0.25, "outElastic")
    tween.start()
  })
  
  console.log(tween)
  
})


console.log(suki)
suki.whenReady(() => {
  console.log("ready!")
  suki.start()
})