/* global URL Image */
import EventEmitter from "./events"

const issuesLink = "https://github.com/RoryDuncan/suki.js/issues"

class Assets {
   
   constructor() {
     this.images      = []
     this.sounds      = []
     this.documents   = []
     this.blobs       = []
   }
   
   get all() {
     return [].concat(this.images, this.sounds, this.documents)
   }
 }

export const assets = new Assets()

//
//
class AssetLoader extends EventEmitter {
  
  constructor() {
    super()
    
    this.load = this.load.bind(this)
  }
  
  
  // load()
  // allows you to load a single path or an array of paths
  load(paths) {
    
    var filePaths = []
    let completed = 0
    
    // determine if we have a single path or an array of them
    if (paths.constructor.name == "Array") {
      filePaths = filePaths.concat(paths)
    }
    else if (paths.constructor.name == "String") {
      filePaths.push(paths)
    }
    else if (paths.constructor.name == "Object") {
      console.warn("AssetLoader: Attempting to parse file paths from an object")
      filePaths = filePaths.concat(Object.values(paths))
    }
    else {
      throw new Error("AssetLoader: Invalid file path")
    }
    
    let total = filePaths.length
    
    let promises = filePaths.map( path => AssetLoader.loadPath(path).then( blob => {
      completed += 1
      this.trigger("progress", completed, total, blob)
      return blob
    }))
    
    return Promise.all(promises).then( data => {
      this.trigger("done")
      return data
    })
  }
  
  static fromMimeType(blob) {
    
    let url = URL.createObjectURL(blob)
    let result = blob
    
    switch (blob.type) {
    
      case "image/png":
      case "image/jpeg":
      case "image/gif":
        let image = new Image()
        image.src = url
        assets.images.push(image)
        result = image
        break
        
      case "audio/mpeg":
      case "audio/wav":
      case "audio/ogg":
      case "audio/*":
        let audio = new Audio()
        audio.src = url
        assets.sounds.push(audio)
        result = audio
        break
        
      case "text/html":
      case "text/plain":
        assets.documents.push({url, blob})
        break
        
      case "application/octet-stream":
      default:
        console.warn(`No support for this filetype yet. Open an issue here: ${issuesLink}`)
        assets.blobs.push(blob)
        break
    }
    
    return result
  }
  
  static loadPath(path) {
    return window.fetch(path)
      .then( response => response.blob() )
      .then( blob => AssetLoader.fromMimeType(blob))
  }
  
}


// exports
export const loader = new AssetLoader()
