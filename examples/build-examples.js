const rollup = require('rollup')
const fs = require("fs")
const path = require("path")

console.log("Building Examples...")

const basePath = "./examples"
var contents = fs.readdirSync(basePath)

var folders = contents
  .filter(a => fs.statSync(path.resolve(__dirname, a)).isDirectory())
  .map(a => {
    return {
      name: a,
      path: [basePath, a, "index.js"].join("/"),
    }
  })

const outputOptions = {
  file: "bundle.js",
  format: 'umd',
}





const build = async function (item) {
  
  console.log(`\t Creating bundle for ${item.name} -> (${item.path})`)
  
  // create a bundle
  const bundle = await rollup.rollup({
    input: item.path,
  })
  

  // write the bundle to disk
  await bundle.write(outputOptions)
  
  console.log(`\t ${item.name} bundled!`)
}

var promises = folders.map(a => new Promise(resolve => resolve(build(a))))


Promise.all(promises)
  .then(() => console.log("Done"))
  .catch(a => {
    console.warn("A Problem Occured!");
    console.error(a)
  })