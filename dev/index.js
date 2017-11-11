import Suki from "../index"

let suki = new Suki()

console.log(suki)
suki.ready(() => console.log("ready!"))
// suki.start()