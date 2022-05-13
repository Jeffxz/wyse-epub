import * as path from 'path'
import {
  Container,
  Epub,
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
import { lookup } from 'mime-types'
import * as fs from 'fs'
import { WYSE_FALLBACK_ID, WYSE_FALLBACK_XHTML, WYSE_FOLDER, WYSE_NAV_ID, WYSE_NAV_XHTML } from '../Constant'
import { PublicationManifest } from 'pub-manifest'

export const WYSE_JSON = 'wyse.json'

function manifestPlaceholder(): PublicationManifest {
  return {
    profile: 'wysebee',
    id: '',
    name: '',
    readingOrder: ['']
  } as PublicationManifest
}

function manifestPath(folder: string): string {
  return folder + path.sep + WYSE_JSON
}

function generateEpubMetadata(manifest: PublicationManifest): Metadata {
  const identifier = new Identifier(manifest.id, manifest.id)
  const title = new Title(manifest.name)
  const lang = new Language('en')
  const meta = new Meta(
    'dcterms:modified',
    new Date(Date.now()).toISOString().split('.')[0] + 'Z'
  )
  return new Metadata([identifier], [title], [lang], [meta])
}

function createFileListRecursively(
  folder: string,
  manifest: PublicationManifest,
  basePath: string
): string[] {
  const folderPath = path.join(basePath, path.sep, folder)
  const files = fs.readdirSync(folderPath)
  let fileList: string[] = []
  files
    .filter((item) => item != WYSE_JSON && !manifest.readingOrder.includes(item))
    .forEach((item) => {
      if (
        folder.length == 0 &&
        (item.startsWith('.') || item == 'mimetype' || item == 'wysebee.opf')
      ) {
        return
      }
      const itemPath = folderPath + path.sep + item
      const relativePath = folder.length == 0 ? item : folder + path.sep + item
      const stats = fs.statSync(itemPath)
      if (stats.isFile()) {
        fileList.push(relativePath)
      } else if (stats.isDirectory()) {
        const list = createFileListRecursively(relativePath, manifest, basePath)
        fileList = [...fileList, ...list]
      }
    })
  return fileList
}

function generateEpubManifest(
  manifest: PublicationManifest,
  basePath: string
): Manifest {
  const itemList: ManifestItem[] = []
  const firstItem = manifest.readingOrder[0]
  const manifestItem = new ManifestItem(
    firstItem,
    firstItem,
    lookup(firstItem) || 'text/html'
  )
  manifestItem.fallback = WYSE_FALLBACK_ID
  itemList.push(manifestItem)

  const filePathList = createFileListRecursively('', manifest, basePath)
  filePathList.forEach((filePath) => {
    if (filePath.endsWith('.epub') || filePath.startsWith(WYSE_FOLDER + path.sep)) {
      return
    }
    const item =
      new ManifestItem(
        filePath.replace(/\//g, '_'),
        filePath,
        lookup(filePath) || 'application/octet-stream'
      )
    if (manifest.coverImage && manifest.coverImage.length > 0 && filePath.includes(manifest.coverImage)) {
      item.properties = ['cover-image']
    }
    itemList.push(item)
  })
  // add dummy nav
  const navItem = new ManifestItem(WYSE_NAV_ID, `${WYSE_FOLDER}/${WYSE_NAV_XHTML}`, 'application/xhtml+xml')
  navItem.properties = ['nav']
  itemList.push(navItem)
  // add html fallback
  const fallbackItem = new ManifestItem(WYSE_FALLBACK_ID, `${WYSE_FOLDER}/${WYSE_FALLBACK_XHTML}`, 'application/xhtml+xml')
  itemList.push(fallbackItem)
  return new Manifest(itemList)
}

function generateEpubSpine(manifest: PublicationManifest): Spine {
  const itemref = new Itemref(manifest.readingOrder[0])
  return new Spine([itemref])
}

function toEpubObject(manifest: PublicationManifest, basePath: string): Epub {
  const container = new Container(['wysebee.opf'])
  const ocf = new Ocf(container)
  const metadata = generateEpubMetadata(manifest)
  const epubManifest = generateEpubManifest(manifest, basePath)
  const spine = generateEpubSpine(manifest)
  const id = manifest.id || manifest.name
  const pkg = new Package(
    metadata,
    epubManifest,
    spine,
    manifest.id,
    '3.0'
  )
  return new Epub(ocf, pkg)
}

export { manifestPlaceholder, manifestPath, toEpubObject }
