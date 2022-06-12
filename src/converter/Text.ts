import * as path from 'path'
import * as fs from 'fs'
import {
  CONTAINER_XML_FILE,
  EPUB_EXT,
  INDEX_HTML,
  METAINF_FOLDER,
  MIMETYPE_FILE,
  WYSEBEE_OPF,
} from '../data/Constant'
import * as JSZip from 'jszip'
import {
  Container,
  Identifier,
  Itemref,
  Language,
  Manifest,
  ManifestItem,
  Meta,
  Metadata,
  Ocf,
  Package,
  Spine,
  Title,
} from 'epub-object-ts'
import { v4 as uuidv4 } from 'uuid'

const generateEpubMetadata = (fileName: string, uuid: string) => {
  const identifier = new Identifier(uuid, uuid)
  const title = new Title(fileName)
  const lang = new Language('en')
  const meta = new Meta(
    'dcterms:modified',
    new Date(Date.now()).toISOString().split('.')[0] + 'Z'
  )
  return new Metadata([identifier], [title], [lang], [meta])
}

const generateEpubManifest = (): Manifest => {
  const itemList: ManifestItem[] = []
  const manifestItem = new ManifestItem(INDEX_HTML, INDEX_HTML, 'text/html')
  itemList.push(manifestItem)
  return new Manifest(itemList)
}

const generateEpubSpine = (): Spine => {
  const itemref = new Itemref(INDEX_HTML)
  return new Spine([itemref])
}

const convertText = (textFile: string) => {
  const absoluteFilePath = textFile.startsWith(path.sep)
    ? textFile
    : path.join(process.cwd(), textFile)
  const folderPath = path.dirname(absoluteFilePath)
  const epubFileName =
    path.basename(absoluteFilePath, path.extname(absoluteFilePath)) + EPUB_EXT
  const epubFilePath = path.join(folderPath, epubFileName)

  const zip = new JSZip()
  zip.file(MIMETYPE_FILE, Ocf.mimetype)

  const textString = fs.readFileSync(absoluteFilePath, { encoding: 'utf8' })
  const htmlString =
    '<!doctype html><html><body><p>' +
    textString.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') +
    '</p></body></html>'
  zip.file(INDEX_HTML, htmlString)
  zip.folder(METAINF_FOLDER)

  const container = new Container([WYSEBEE_OPF])
  zip.file(path.join(METAINF_FOLDER, CONTAINER_XML_FILE), container.toXmlString())

  const uuid = uuidv4()
  const metadata = generateEpubMetadata(textFile, uuid)
  const epubManifest = generateEpubManifest()
  const spine = generateEpubSpine()
  const pkg = new Package(metadata, epubManifest, spine, uuid, '3.0')
  zip.file(WYSEBEE_OPF, pkg.toXmlString())

  zip
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(epubFilePath))
    .on('finish', () => {
      console.log(`Saved epub file to ${epubFilePath}`)
    })
}

export default convertText
