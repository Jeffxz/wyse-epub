import * as path from 'path'
import { WyseManifest, manifestPlaceholder } from './WyseManifest'
import * as fs from 'fs'

class ManifestGenerator {
  scanFolder(folder: string): WyseManifest {
    const folderPath = path.join(process.cwd(), folder)
    const pathList = folderPath.split(path.sep).filter(item => item != '')
    const titleCandidate = pathList[pathList.length - 1]
    let manifest = manifestPlaceholder()
    manifest.name = titleCandidate
    const files = fs.readdirSync(folderPath)
    if (manifest.entry.length == 0) {
      files.forEach(file => {
        const ext = path.extname(file)
        if (ext == '.xhtml' || ext == '.html' || ext == '.htm') {
          manifest.entry = file
        }
      })
    }
    return manifest
  }

  saveManifest(folder: string, manifest: WyseManifest) {
    const folderPath = path.join(process.cwd(), folder)
    fs.writeFileSync(folderPath + path.sep + 'wyse.json', JSON.stringify(manifest, null, 2))
  }
}

export default ManifestGenerator
