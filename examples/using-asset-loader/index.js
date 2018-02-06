/* global Image */
import { suki } from "../../index"
import { gamestate, State } from "../../state"
import { manager, Tween } from "../../tween"
import keyboard from "../../keyboard"
import World from "../../world"
import { assets, loader} from "../../asset-loader"

/*
    In this example:
    
    We load 3 files using imported `loader`
    We access the image we load via the imported `assets`
    
    We then render the image onto our map.
    Additionally, you can move the map with the keyboard
*/

manager.mount()
const world = new World(suki.renderer)
world.center()

const state = new State({
  
  name: "play-game",
  
  data: {
    message: "Use your keyboard to view everything",
    image: null,
  },
  
  // in order to utilize async load(), this flag must be set
  isAsync: true,
  
  async load() {
    return loader.load(["image.png", "sound.wav", "sound.mp3"])
  },
  
  init() {
    // add our image to the data of this state
    this.data.image = assets.images[0]
  },
  
  enter() {
    // begin listening for events
    keyboard.capture()
  },
  
  render(time, $, suki, data) {
    $.clear("#fff")

    world.drawImage(this.data.image, 0, 0)
    
    $.fillStyle("#000").font("15px Arial").fillText(data.message, 1000, 50)
    
    
    // move the world with our keyboard
    if (keyboard.pressed[0] == "left")  world.move(-10, 0)
    if (keyboard.pressed[0] == "right") world.move(10, 0)
    if (keyboard.pressed[0] == "up")    world.move(0, 10)
    if (keyboard.pressed[0] == "down")  world.move(0, -10)
    
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