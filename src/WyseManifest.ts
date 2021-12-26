import * as path from 'path'
import {
  Container,
  Epub,
  Identifier, Itemref,
  Language,
  Manifest,
  ManifestItem,
  Metadata,
  Ocf, Package,
  Spine,
  Title,
} from 'epub-object-ts'
import { lookup } from 'mime-types'
import EpubPackager from './EpubPackager'
import * as fs from 'fs'
import { stringify } from 'querystring'

const WYSE_JSON = 'wyse.json'

type WyseManifest = {
  name: string,
  uniqueIdentifier: string,
  version: string,
  description: string,
  entry: string,
  viewport: {
    width: number,
    height: number
  },
  author: string,
  copyright: string
}

function manifestPlaceholder(): WyseManifest {
  return {
    name: '',
    uniqueIdentifier: '',
    version: '0.0.1',
    description: '',
    entry: '',
    viewport: {
      width: 800,
      height: 600
    },
    author: '',
    copyright: 'free'
  } as WyseManifest
}

function manifestPath(folder: string): string {
  return folder + path.sep + WYSE_JSON
}

function generateEpubMetadata(manifest: WyseManifest): Metadata {
  const identifier = new Identifier(manifest.uniqueIdentifier)
  const title = new Title(manifest.name)
  const lang = new Language('en')
  return new Metadata([identifier], [title], [lang], [])
}

function scanItem(folder: string, manifest: WyseManifest, basePath: string): string[] {
  const folderPath = path.join(basePath, path.sep, folder)
  const files = fs.readdirSync(folderPath)
  let fileList: string[] = []
  files.filter(item => !item.startsWith('.') && item != WYSE_JSON && item != manifest.entry).forEach(item => {
    const itemPath = folderPath + path.sep + item
    const relativePath = folder + path.sep + item
    const stats = fs.statSync(itemPath)
    if (stats.isFile()) {
      fileList.push(relativePath)
    } else if (stats.isDirectory()) {
      const list = scanItem(relativePath, manifest, basePath)
      fileList = [...fileList, ...list]
    }
  })
  return fileList
}

function generateEpubManifest(manifest: WyseManifest, basePath: string): Manifest {
  let itemList: ManifestItem[] = []
  const manifestItem = new ManifestItem(manifest.entry, manifest.entry, lookup(manifest.entry) || 'text/html')
  itemList.push(manifestItem)

  const filePathList = scanItem('', manifest, basePath)
  filePathList.forEach(filePath => {
    itemList.push(new ManifestItem(filePath, filePath, lookup(filePath) || 'application/octet-stream'))
  })
  return new Manifest(itemList)
}

function generateEpubSpine(manifest: WyseManifest): Spine {
  const itemref = new Itemref(manifest.entry)
  return new Spine([itemref])
}

function toEpubObject(manifest: WyseManifest, basePath: string): Epub {
  const container = new Container(['./content.opf'])
  const ocf = new Ocf(container)
  const metadata = generateEpubMetadata(manifest)
  const epubManifest = generateEpubManifest(manifest, basePath)
  const spine = generateEpubSpine(manifest)
  const pkg = new Package(metadata, epubManifest, spine, manifest.uniqueIdentifier, '3.2')
  return new Epub(ocf, pkg)
}

export { WyseManifest, manifestPlaceholder, manifestPath, toEpubObject }
