import Suki from "../../index"
import { gamestate, State } from "../../state"

//
// In this example:
// we create two states and change between them using clicks
// we also measure how long it takes to change states.. 
//    though it's not of real value and we don't expect it to be non-performant
//


let suki = new Suki()

// set a reference to suki for all of our gamestates to utilize
// required!
gamestate.ref = suki


var stateChangeDuration = 0.00

// create a title screen state
// when inside the title screen state, we render the menu items
const titleState = new State({
  
  name: "title-screen",
  
  data: {
    message: "Blue State"
  },
  
  render: (time, $, suki, data) => {
    
    $.clear("#07c")
      .fillStyle("#fff")
      .font("15px Arial")
      .fillText(data.message, 100, 150)
      .fillText("Click to change to toggle current state", 100, 175)
      .fillText(`Changing to this state took ${stateChangeDuration}ms`, 100, 190)
  }
})

const playState = new State({
  
  name: "play-game",
  
  data: {
    message: "Maroon State"
  },
  
  render: (time, $, suki, data) => {
      
    $.clear("#707")
      .fillStyle("#fff")
      .font("15px Arial")
      .fillText(data.message, 100, 150)
      .fillText("Click to change to toggle current state", 100, 175)
      .fillText(`Changing to this state took ${stateChangeDuration}ms`, 100, 190)
      
  }
})


gamestate.add(titleState)
gamestate.add(playState)

gamestate.change(titleState.name)

// change between the states when clicking
var toggle = false;
document.addEventListener("click", (e) => {
  let nextState = toggle ?  titleState : playState ;
  let start = performance.now() /* global performance */
  gamestate.change(nextState.name)
  stateChangeDuration = (performance.now() - start).toFixed(2)
  toggle = !toggle
})


console.log(suki)
suki.whenReady(() => {
  console.log("ready!")
  suki.start()
})