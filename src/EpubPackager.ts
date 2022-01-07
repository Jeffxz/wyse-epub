import * as path from 'path'
import * as fs from 'fs'
import { manifestPath, toEpubObject, WyseManifest } from './WyseManifest'
import { Epub, Ocf } from 'epub-object-ts'
import ManifestGenerator from './ManifestGenerator'

class EpubPackager {
  pack(folder: string, force: boolean) {
    const folderPath = path.join(process.cwd(), folder)
    const wysePath = manifestPath(folderPath)
    if (!fs.existsSync(wysePath)) {
      const generator = new ManifestGenerator()
      const manifest = generator.scanFolder(folder)
      generator.saveManifest(folder, manifest)
    }

    fs.readFile(wysePath, (error, data) => {
      if (error) throw error
      let manifest = JSON.parse(data.toString()) as WyseManifest
      const epub = toEpubObject(manifest, folderPath)
      const mimetypePath = path.join(folderPath, 'mimetype')
      if (force && fs.existsSync(mimetypePath)) {
        fs.rmSync(mimetypePath, { force: true })
      }
      fs.writeFileSync(mimetypePath, Ocf.mimetype)
      const containerFolder = path.join(folderPath, 'META-INF')
      if (force && fs.existsSync(containerFolder)) {
        fs.rmSync(containerFolder, { force: true, recursive: true })
      }
      fs.mkdirSync(containerFolder)
      fs.writeFileSync(path.join(containerFolder, 'container.xml'), epub.ocf.container.toXmlString())
      const opfPath = path.join(folderPath, 'wysebee.opf')
      if (force && fs.existsSync(mimetypePath)) {
        fs.rmSync(opfPath, { force: true })
      }
      fs.writeFileSync(opfPath, epub.epubPackage.toXmlString())
    })
  }
}

export default EpubPackager
