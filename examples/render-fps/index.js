import Suki from "../index"

let suki = new Suki()

console.log(suki)
suki.ready(() => {
  console.log("ready!")
  suki.start()
})

suki.events.on("step", (time) => {
  
})


suki.events.on("render", (time, $) => {
  $.clear("#07c")
    .fillStyle("#fff")
    .fillText(`${time.fps.toFixed(0)} fps`, 50, 50)
    .fillText(`${suki.stats.skippedFrames} frames skipped`, 50, 75)
})