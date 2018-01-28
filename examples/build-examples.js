const rollup = require('rollup')
const fs = require("fs")
const path = require("path")

/*
    Builds all Examples in the /examples folder
    Each one is done independently
*/

console.log("Building Examples...")

const basePath = "./examples"
var contents = fs.readdirSync(basePath)

// retrieve all sub directories of the currentbasePath
// and prepare the configuration for rollup.js
var folders = contents
  .filter(a => fs.statSync(path.resolve(__dirname, a)).isDirectory())
  .map(a => {
    return {
      name: a,
      input: [basePath, a, "index.js"].join("/"),
      output: [basePath, a, "bundle.js"].join("/"),
    }
  })

const build = async function (item) {
  
  console.log(`\t Creating bundle for ${item.name} -> (${item.input})`)
  
  // create a bundle
  const bundle = await rollup.rollup({
    input: item.input,
  })

  // write the bundle to disk
  await bundle.write({
    file: item.output,
    format: 'umd',
  })
  
  console.log(`\t Bundled ${item.name} as ${item.output}`)
}

// wait for all bundles to build, then log that it's done
var promises = folders.map(a => new Promise(resolve => resolve(build(a))))

Promise.all(promises)
  .then(() => console.log("Done."))
  .catch(a => {
    console.warn("A Problem Occured!");
    console.error(a)
  })