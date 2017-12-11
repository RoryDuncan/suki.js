import Suki from "../../index"

let suki = new Suki()

console.log(suki)
suki.whenReady(() => {
  console.log("ready!")
  suki.start()
})


suki.events.on("render", (time, $) => {
  $.clear("#07c")
    .fillStyle("#fff")
    .fillText(`${time.ticks} ticks`, 50, 20)
    .fillText(`${suki.stats.fps().toFixed(0)} fps`, 50, 35)
    .fillText(`${suki.stats.skippedFrames} frames skipped`, 50, 50)
})