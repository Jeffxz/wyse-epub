import * as path from 'path'
import * as fs from 'fs'
import { manifestPath, toEpubObject, WyseManifest } from './WyseManifest'

class EpubPackager {
  pack(folder: string) {
    const folderPath = path.join(process.cwd(), folder)
    console.log(`packaging epub from folder ${folderPath}`)
    const wysePath = manifestPath(folderPath)
    if (fs.existsSync(wysePath)) {
      fs.readFile(wysePath, (error, data) => {
        if (error) throw error
        let manifest = JSON.parse(data.toString()) as WyseManifest
        const epub = toEpubObject(manifest, folderPath)
        // console.log(epub)
      })
    } else {
      console.log('could not find wyse.json. Have you run "wyse init ./" in this folder?')
    }
  }
}

export default EpubPackager
