import Suki from "../../index"
import { gamestate, State } from "../../state"

let suki = new Suki()

// set a reference to suki for all of our gamestates to utilize
gamestate.ref = suki

// create a title screen state
// when inside the title screen state, we render the menu items
const title = new State({
  
  name: "title-screen",
  
  render: (time, $, suki) => {
    $.clear("#07c")
      .fillStyle("#fff")
      .font("20px Arial")
      
      
      ;[
        "Suki.js",
        "> Play",
        "> Options",
        "> Credits",
        "> Exit"
      ].forEach((a, i) => $.fillText(a, 100, 100 + (i * 25)))
      
    
  }
})

gamestate.add(title)
gamestate.change(title.name)

console.log(suki)
suki.whenReady(() => {
  console.log("ready!")
  suki.start()
})