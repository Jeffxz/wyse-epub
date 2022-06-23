import * as fs from 'fs'
import {
  BOOK_ID,
  CONTAINER_XML_FILE,
  CONTAINER_XML_PLACEHOLDER,
  METAINF_FOLDER,
  MIMETYPE_FILE, NAV_XHTML_PLACEHOLDER, WYSE_CONTENT_FILE, WYSE_CONTENT_PLACEHOLDER,
  WYSE_NAV_XHTML,
} from '../data/Constant'
import * as path from 'path'
import {
  Creator, DIR,
  Identifier, Itemref,
  Language,
  Manifest,
  ManifestItem,
  Meta,
  Metadata,
  Ocf,
  Package,
  Publisher, Spine,
  Title,
  Constants,
} from 'epub-object-ts'
import { WyseConfig } from '../data/WyseConfig'
import { randomUUID } from 'crypto'
import * as JSZIP from 'jszip'
import fetch from 'node-fetch'
const chalk = require('chalk')

const generatePlaceholderEpubMetadata = (config: WyseConfig) => {
  const identifier = new Identifier(config.bookId, BOOK_ID)
  const title = new Title(config.title)
  const lang = new Language('en')
  if (config.language && config.language.length > 0) {
    lang.contentText = config.language[0]
  }
  const metaList: Meta[] = []
  metaList.push(new Meta(
    'dcterms:modified',
    new Date(Date.now()).toISOString().split('.')[0] + 'Z'
  ))
  if (config.isFXL) {
    metaList.push(new Meta(
      Constants.META_RENDITION_LAYOUT_NAME,
      Constants.META_RENDITION_LAYOUT_VALUE_FXL
    ))
    metaList.push(new Meta(
      Constants.META_RENDITION_ORIENTATION_NAME,
      Constants.META_RENDITION_ORIENTATION_VALUE_PORTRAIT
    ))
    metaList.push(new Meta(
      Constants.META_RENDITION_SPREAD_NAME,
      Constants.META_RENDITION_SPREAD_VALUE_LANDSCAPE
    ))
  }
  const metadata = new Metadata([identifier], [title], [lang], metaList)
  if (config.author) {
    const creator = new Creator(config.author)
    metadata.creatorList.push(creator)
  }
  if (config.publisher) {
    const publisher = new Publisher(config.publisher)
    metadata.creatorList.push(publisher)
  }

  return metadata
}

const generatePlaceholderEpubManifest = (config: WyseConfig): Manifest => {
  const itemList: ManifestItem[] = []
  const manifestItem = new ManifestItem('content_001', WYSE_CONTENT_FILE, 'application/xhtml+xml')
  itemList.push(manifestItem)
  const navItem = new ManifestItem('nav', WYSE_NAV_XHTML, 'application/xhtml+xml')
  navItem.properties = ['nav']
  itemList.push(navItem)
  return new Manifest(itemList)
}

const generatePlaceholderEpubSpine = (config: WyseConfig): Spine => {
  const itemList: Itemref[] = []
  itemList.push(new Itemref('content_001'))
  const spine = new Spine(itemList)
  if (config.isRTL) {
    spine.pageProgressionDirection = DIR.RTL
  }
  return spine
}

const retrieveRemoteTemplateEpub = (epubUrl: string, epubFolder: string) => {
  fetch(epubUrl)
    .then(response => response.buffer())
    .then(JSZIP.loadAsync)
    .then((zip) => {
      Object.keys(zip.files).forEach((filename) => {
        const dest = path.join(epubFolder, filename)
        if (filename.endsWith(path.sep)) {
          fs.mkdirSync(dest)
        }
        const zipFile = zip.file(filename)
        if (zipFile) {
          zipFile.async('nodebuffer').then(function(content) {
            fs.writeFileSync(dest, content)
          })
        }
      })
    })
    .catch(error => {
      console.log(chalk.red(error.message))
    })

}

const createEpubFolder = (folder: string, template?: string, configFilePath?: string) => {
  const epubFolder = folder
  if (fs.existsSync(epubFolder)) {
    fs.rmdirSync(epubFolder, { recursive: true })
  }
  fs.mkdirSync(epubFolder)
  try {
    if (template) {
      if (template === 'epub-tests') {
        retrieveRemoteTemplateEpub('https://github.com/w3c/epub-tests/raw/main/tests/xx-epub-template.epub', epubFolder)
      } else if (template === 'epub-tests-fxl') {
        retrieveRemoteTemplateEpub('https://github.com/w3c/epub-tests/raw/main/tests/xx-fixed-layout-template.epub', epubFolder)
      } else {
        console.log(chalk.red(`unknown template "${template}", currently support template name: "epub-tests", "epub-tests-fxl"`))
      }
    } else {
      const mimetypePath = path.join(epubFolder, MIMETYPE_FILE)
      fs.writeFileSync(mimetypePath, Ocf.mimetype)
      const containerFolder = path.join(epubFolder, METAINF_FOLDER)
      fs.mkdirSync(containerFolder)
      fs.writeFileSync(
        path.join(containerFolder, CONTAINER_XML_FILE),
        CONTAINER_XML_PLACEHOLDER
      )
      const contentFolder = path.join(epubFolder, 'EPUB')
      fs.mkdirSync(contentFolder)
      const opfPath = path.join(contentFolder, 'content.opf')
      let configJson: WyseConfig = {
        title: 'Book title goes here',
        author: 'Auth name goes here',
        bookId: `wyse:${randomUUID()}`,
        language: 'en',
      }
      if (configFilePath) {
        if (!fs.existsSync(configFilePath)) {
          console.log(chalk.red('specified config file does not exist, continue with default config.'))
        } else {
          const data = fs.readFileSync(configFilePath, {encoding: 'utf-8'})
          configJson = JSON.parse(data) as WyseConfig
        }
      }
      const manifest = generatePlaceholderEpubManifest(configJson)
      const spine = generatePlaceholderEpubSpine(configJson)
      const metadata = generatePlaceholderEpubMetadata(configJson)
      const epubPackage = new Package(metadata, manifest, spine, BOOK_ID, '3.0')
      fs.writeFileSync(
        opfPath,
        epubPackage.toXmlString()
      )
      fs.writeFileSync(
        path.join(contentFolder, WYSE_NAV_XHTML),
        NAV_XHTML_PLACEHOLDER
      )
      fs.writeFileSync(
        path.join(contentFolder, WYSE_CONTENT_FILE),
        WYSE_CONTENT_PLACEHOLDER
      )
    }
  } catch (error) {
    console.log(chalk.red(error))
  }
}

export default createEpubFolder
