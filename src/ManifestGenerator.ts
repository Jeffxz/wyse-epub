import * as path from 'path'
import { WyseManifest, manifestPlaceholder, manifestPath } from './WyseManifest'
import * as fs from 'fs'

class ManifestGenerator {
  scanFolder(folder: string): WyseManifest {
    const folderPath = path.join(process.cwd(), folder)
    const pathList = folderPath.split(path.sep).filter(item => item != '')
    const titleCandidate = pathList[pathList.length - 1]
    const defaultUUID = titleCandidate + ".gardenia-corp.com"
    let manifest = manifestPlaceholder()
    manifest.name = titleCandidate
    manifest.uniqueIdentifier = defaultUUID
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
    fs.writeFileSync(manifestPath(folderPath), JSON.stringify(manifest, null, 2))
  }
}

export default ManifestGenerator
