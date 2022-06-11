import * as fs from 'fs'
import { lookup } from 'mime-types'
import {
  DIR,
  Identifier,
  Itemref,
  Language,
  Manifest,
  ManifestItem,
  Meta,
  Metadata, Ocf,
  Spine,
  Title,
} from 'epub-object-ts'
import { PublicationManifest, TextDirection } from 'pub-manifest'
import {
  META_RENDITION_LAYOUT_NAME,
  META_RENDITION_LAYOUT_VALUE_FXL,
  META_RENDITION_ORIENTATION_NAME,
  META_RENDITION_ORIENTATION_VALUE_PORTRAIT,
  META_RENDITION_SPREAD_NAME,
  META_RENDITION_SPREAD_VALUE_LANDSCAPE,
} from 'epub-object-ts/src/constants'
import * as path from 'path'
import { CONTAINER_XML, METAINF_FOLDER, MIMETYPE_FILE, WYSE_FOLDER, WYSE_NAV_XHTML, WYSEBEE_OPF } from '../data/Constant'
import { Creator, Package, Publisher } from 'epub-object-ts'
import imageSize from 'image-size'
import { WyseConfig } from '../data/WyseConfig'

const IMAGES_FOLDER = 'images'
const BOOK_ID = 'bookid'

const generateEpubMetadata = (config: WyseConfig) => {
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
  metaList.push(new Meta(
    META_RENDITION_LAYOUT_NAME,
    META_RENDITION_LAYOUT_VALUE_FXL
  ))
  metaList.push(new Meta(
    META_RENDITION_ORIENTATION_NAME,
    META_RENDITION_ORIENTATION_VALUE_PORTRAIT
  ))
  metaList.push(new Meta(
    META_RENDITION_SPREAD_NAME,
    META_RENDITION_SPREAD_VALUE_LANDSCAPE
  ))
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

const generateEpubManifest = (pageList: string[], imageList: string[], config: WyseConfig): Manifest => {
  const itemList: ManifestItem[] = []
  pageList.forEach((item) => {
    const manifestItem = new ManifestItem(item.replace('.xhtml', ''), item, 'application/xhtml+xml')
    itemList.push(manifestItem)
  })
  imageList.forEach((item) => {
    const mimetype = lookup(item)
    if (mimetype) {
      const manifestItem = new ManifestItem(item, path.join(IMAGES_FOLDER, item), mimetype)
      if (config.coverImage && item.includes(config.coverImage)) {
        manifestItem.properties = ['cover-image']
      }
      itemList.push(manifestItem)
    }
  })
  const navItem = new ManifestItem('nav', WYSE_NAV_XHTML, 'application/xhtml+xml')
  navItem.properties = ['nav']
  itemList.push(navItem)
  return new Manifest(itemList)
}

const generateEpubSpine = (pageList: string[], config: WyseConfig): Spine => {
  const itemList: Itemref[] = []
  pageList.forEach((item) => {
    const itemref = new Itemref(item.replace('.xhtml', ''))
    itemList.push(itemref)
  })
  const spine = new Spine(itemList)
  if (config.isRTL) {
    spine.pageProgressionDirection = DIR.RTL
  }
  return spine
}

const convertImages = (imageFolder: string, config: WyseConfig) => {
  if (imageFolder.endsWith(path.sep)) {
    imageFolder = imageFolder.slice(0, -1)
  }
  const files = fs.readdirSync(imageFolder)
  let imageList: string[] = []
  let pageList: string[] = []
  files.forEach((item, index) => {
    const mimetype = lookup(item)
    if (mimetype && mimetype.startsWith('image/')) {
      imageList.push(item)
      const xhtmlName = `page_${index + 1}.xhtml`
      pageList.push(xhtmlName)
    }
  })
  const manifest = generateEpubManifest(pageList, imageList, config)
  const spine = generateEpubSpine(pageList, config)
  const metadata = generateEpubMetadata(config)
  const outputFolderName = `${imageFolder}_epub`
  if (fs.existsSync(outputFolderName)) {
    fs.rmdirSync(outputFolderName, { recursive: true })
  }
  fs.mkdirSync(outputFolderName)
  const mimetypePath = path.join(outputFolderName, MIMETYPE_FILE)
  fs.writeFileSync(mimetypePath, Ocf.mimetype)
  const containerFolder = path.join(outputFolderName, METAINF_FOLDER)
  fs.mkdirSync(containerFolder)
  const containerString = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
  <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml" />
</rootfiles>
</container>`
  fs.writeFileSync(
    path.join(containerFolder, CONTAINER_XML),
    containerString
  )
  const contentFolder = path.join(outputFolderName, 'EPUB')
  fs.mkdirSync(contentFolder)
  const opfPath = path.join(contentFolder, 'content.opf')
  const epubPackage = new Package(metadata, manifest, spine, BOOK_ID, '3.0')
  fs.writeFileSync(
    opfPath,
    epubPackage.toXmlString()
  )
  const contentImagesFolder = path.join(contentFolder, IMAGES_FOLDER)
  fs.mkdirSync(contentImagesFolder)
  imageList.forEach((imageFile) => {
    const sourceFile = path.join(imageFolder, imageFile)
    const destFile = path.join(contentImagesFolder, imageFile)
    fs.copyFileSync(sourceFile, destFile)
  })
  let lang = 'en'
  if (config.language && config.language.length > 0) {
    lang = config.language
  }
  let liItemListString = ''
  pageList.forEach((pageFile, index) => {
    const imageFile = path.join(imageFolder, imageList[index])
    const imageDimensions = imageSize(imageFile)
    const pageFilePath = path.join(contentFolder, pageFile)
    const pageContent = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:xml="http://www.w3.org/XML/1998/namespace" 
  xmlns:epub="http://www.idpf.org/2007/ops"
  xml:lang="${lang}">
  <head>
    <title>${config.title} Page ${index + 1}</title>
    <meta name="viewport" content="width=${imageDimensions.width}, height=${imageDimensions.height}"/> 
  </head>
  <body epub:type="bodymatter">
    <img src="images/${imageList[index]}" alt="Page ${index + 1}"/>
  </body>
</html> 
    `
    fs.writeFileSync(
      pageFilePath,
      pageContent
    )
    liItemListString += `
<li><a href="${pageFile}">Page ${index + 1}</a></li>
`
  })

  // prepare nav file
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
	${liItemListString}
	</ol>
	</nav>
	</body>
</html>`
  fs.writeFileSync(
    path.join(contentFolder, WYSE_NAV_XHTML),
    navXhtmlStr
  )
}

export default convertImages
