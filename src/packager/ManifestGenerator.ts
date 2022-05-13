import * as path from 'path'
import { manifestPlaceholder, manifestPath } from './WyseManifest'
import * as fs from 'fs'
import * as JSZip from 'jszip'
import { Container, Epub, Ocf, Package } from 'epub-object-ts'
import EpubToWyseManifest from '../converter/EpubToWyseManifest'
import { PublicationManifest } from '../../../pub-manifest'

class ManifestGenerator {
  scanFolder(folder: string): PublicationManifest {
    const folderPath = folder.startsWith(path.sep)
      ? folder
      : path.join(process.cwd(), folder)
    const pathList = folderPath.split(path.sep).filter((item) => item != '')
    const titleCandidate = pathList[pathList.length - 1]
    const defaultUUID = titleCandidate + '.wysebee.com'
    const manifest = manifestPlaceholder()
    manifest.name = titleCandidate
    manifest.id = defaultUUID
    manifest.readingOrder = []
    const files = fs.readdirSync(folderPath)
    if (manifest.readingOrder.length == 0) {
      files.forEach((file) => {
        const ext = path.extname(file)
        if (ext == '.xhtml' || ext == '.html' || ext == '.htm') {
          manifest.readingOrder.push(file)
        }
      })
    }
    return manifest
  }

  saveManifest(folder: string, manifest: PublicationManifest) {
    const folderPath = path.join(process.cwd(), folder)
    fs.writeFileSync(
      manifestPath(folderPath),
      JSON.stringify(manifest, null, 2)
    )
  }

  epubToManifest(epub: string, jsonFile: string) {
    const epubPath = path.join(process.cwd(), epub)
    const stats = fs.statSync(epubPath)
    if (stats.isFile()) {
      this.epubFileToManifest(epubPath, jsonFile)
    } else if (stats.isDirectory()) {
      this.epubFolderToManifest(epubPath, jsonFile)
    }
  }

  epubFileToManifest(fileName: string, jsonFile: string) {
    let epub: Epub | null
    let ocf: Ocf | null
    let epubPackage: Package | null
    try {
      fs.readFile(fileName, (error, data) => {
        JSZip.loadAsync(data).then((zip) => {
          zip.files[Ocf.containerPath]
            .async('string')
            .then((xmlString) => {
              const container = Container.loadFromXML(xmlString)
              if (container) {
                ocf = new Ocf(container)
                return ocf
              } else {
                throw new Error(
                  `could not find epub container from path ${Ocf.containerPath}`
                )
                return null
              }
            })
            .then((ocf) => {
              if (ocf) {
                zip.files[ocf.container.rootfiles[0].fullPath]
                  .async('string')
                  .then((xmlString) => {
                    epubPackage = Package.loadFromXML(xmlString)
                    if (epubPackage != null) {
                      epub = new Epub(ocf, epubPackage)
                    }
                  })
                  .then(() => {
                    if (epub) {
                      const manifest = EpubToWyseManifest.convert(epub)
                      fs.writeFileSync(jsonFile, JSON.stringify(manifest, null, 2))
                    }
                  })
                  .catch((error) => {
                    throw error
                  })
              }
            })
            .catch((error) => {
              console.error(error)
            })
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  epubFolderToManifest(folderName: string, jsonFile: string) {
    try {
      const containerPath = path.join(folderName, Ocf.containerPath)
      const ocfString = fs.readFileSync(containerPath, 'utf8')
      const container = Container.loadFromXML(ocfString)
      if (container) {
        const ocf = new Ocf(container)
        if (ocf) {
          const opfString = fs.readFileSync(path.join(folderName, ocf.container.rootfiles[0].fullPath), 'utf8')
          const epubPackage = Package.loadFromXML(opfString)
          let epub: Epub | null
          if (epubPackage) {
            epub = new Epub(ocf, epubPackage)
            if (epub) {
              const manifest = EpubToWyseManifest.convert(epub)
              fs.writeFileSync(path.join(folderName, jsonFile), JSON.stringify(manifest, null, 2))
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export default ManifestGenerator
