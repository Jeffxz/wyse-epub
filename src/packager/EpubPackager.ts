import * as path from 'path'
import * as fs from 'fs'
import { manifestPath, toEpubObject } from './WyseManifest'
import { Container, Ocf, Package } from 'epub-object-ts'
import ManifestGenerator from './ManifestGenerator'
import * as JSZip from 'jszip'
import {
  CONTAINER_XML,
  EPUB_EXT,
  METAINF_FOLDER,
  MIMETYPE_FILE, WYSE_FALLBACK_XHTML, WYSE_FOLDER, WYSE_NAV_XHTML,
  WYSEBEE_OPF,
} from '../data/Constant'
import { PublicationManifest } from 'pub-manifest'

class EpubPackager {
  createEpubPackage(folder: string, force: boolean) {
    const folderPath = folder.startsWith(path.sep)
      ? folder
      : path.join(process.cwd(), folder)
    const wysePath = manifestPath(folderPath)
    if (!fs.existsSync(wysePath)) {
      const generator = new ManifestGenerator()
      const manifest = generator.scanFolder(folder)
      generator.saveManifest(folder, manifest)
    }

    fs.readFile(wysePath, (error, data) => {
      if (error) throw error
      const manifest = JSON.parse(data.toString()) as PublicationManifest
      const epub = toEpubObject(manifest, folderPath)
      const mimetypePath = path.join(folderPath, MIMETYPE_FILE)
      if (force && fs.existsSync(mimetypePath)) {
        fs.rmSync(mimetypePath, { force: true })
      }
      fs.writeFileSync(mimetypePath, Ocf.mimetype)
      const containerFolder = path.join(folderPath, METAINF_FOLDER)
      if (force && fs.existsSync(containerFolder)) {
        fs.rmSync(containerFolder, { force: true, recursive: true })
      }
      fs.mkdirSync(containerFolder)
      fs.writeFileSync(
        path.join(containerFolder, CONTAINER_XML),
        epub.ocf.container.toXmlString()
      )
      const opfPath = path.join(folderPath, WYSEBEE_OPF)
      if (force && fs.existsSync(mimetypePath)) {
        fs.rmSync(opfPath, { force: true })
      }

      // prepare temp nav and fallback files
      const wyseFolder = path.join(folderPath, WYSE_FOLDER)
      if (force && fs.existsSync(wyseFolder)) {
        fs.rmSync(wyseFolder, { force: true, recursive: true })
      }
      fs.mkdirSync(wyseFolder)
      const navXhtmlStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en"> 
	<head>
		<title>Table of Contents</title>
	</head>
	<body>
	<nav epub:type="toc" id="toc" role="doc-toc">
	<h1>Placeholder for table of contents</h1>
	<ol>
    <li><a href="../${manifest.readingOrder[0]}">entry page</a></li>
	</ol>
	</nav>
	</body>
</html>`
      fs.writeFileSync(
        path.join(wyseFolder, WYSE_NAV_XHTML),
        navXhtmlStr
      )
      const fallbackXhtmlStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en"> 
	<head>
		<title>Fallback XHTML</title>
	</head>
	<body>
	</body>
</html>
      `
      fs.writeFileSync(
        path.join(wyseFolder, WYSE_FALLBACK_XHTML),
        fallbackXhtmlStr
      )
      fs.writeFileSync(opfPath, epub.epubPackage.toXmlString())
    })
  }

  private addFileToZip = (
    zip: JSZip,
    fullPathInsideEpub: string,
    fileSystemFolderPath: string
  ) => {
    const pathList = fullPathInsideEpub
      .split(path.sep)
      .filter((item) => item.length > 0)
    const opfFile = pathList.pop()
    if (pathList.length > 0) {
      let opfPath = ''
      pathList.forEach((item) => {
        opfPath = path.join(opfPath, item)
        zip.folder(opfPath)
      })
    }
    if (opfFile) {
      const stream = fs.createReadStream(
        path.join(fileSystemFolderPath, fullPathInsideEpub)
      )
      zip.file(fullPathInsideEpub, stream)
    }
  }

  pack(folder: string) {
    const folderPath = folder.startsWith(path.sep)
      ? folder
      : path.join(process.cwd(), folder)
    const fileName =
      path.basename(folderPath, path.extname(folderPath)) + EPUB_EXT
    const epubPath = path.join(folderPath, fileName)
    const zip = new JSZip()

    let stream = fs.createReadStream(path.join(folderPath, MIMETYPE_FILE))
    zip.file(MIMETYPE_FILE, stream)

    zip.folder(METAINF_FOLDER)
    const containerFolder = path.join(folderPath, METAINF_FOLDER)
    stream = fs.createReadStream(path.join(containerFolder, CONTAINER_XML))
    zip.file(path.join(METAINF_FOLDER, CONTAINER_XML), stream)
    const xmlString = fs.readFileSync(
      path.join(containerFolder, CONTAINER_XML),
      { encoding: 'utf8' }
    )
    const container = Container.loadFromXML(xmlString)
    container?.rootfiles?.forEach((rootfile) => {
      this.addFileToZip(zip, rootfile.fullPath, folderPath)

      const xmlString = fs.readFileSync(
        path.join(folderPath, rootfile.fullPath),
        { encoding: 'utf8' }
      )
      const epubPackage = Package.loadFromXML(xmlString)
      epubPackage?.manifest.items.forEach((item) => {
        this.addFileToZip(zip, item.href, folderPath)
      })
    })

    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(epubPath))
      .on('finish', () => {
        console.log(`Saved epub file to ${epubPath}`)
      })
  }
}

export default EpubPackager
