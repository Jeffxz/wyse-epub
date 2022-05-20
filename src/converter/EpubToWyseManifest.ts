import { DIR, Epub, EpubHelper } from 'epub-object-ts'
import {
  LocalizableString,
  LinkedResource,
  PublicationManifest,
  TextDirection,
} from 'pub-manifest'

export default class EpubToWyseManifest {
  static convert(epub: Epub): PublicationManifest | null {
    const epubHelper = new EpubHelper(epub)
    let manifest: PublicationManifest = {
      profile: 'wysebee',
      readingOrder: [],
      author: epubHelper.authors?.join(),
      creator: epubHelper.creators?.map(item => item.contentText).join(),
      publisher: epubHelper.publishers?.map(item => item.contentText).join(),
      contributor: epubHelper.contributors?.map(item => item.contentText).join(),
      accessMode: epubHelper.a11yInfo?.accessMode,
      accessibilityFeature: epubHelper.a11yInfo?.accessibilityFeature,
      accessibilityHazard: epubHelper.a11yInfo?.accessibilityHazard,
      accessibilitySummary: epubHelper.a11yInfo?.accessibilitySummary[0],
      coverImage: epubHelper.coverImage?.href,
      name: epubHelper.title(),
      id: epubHelper.id
    }
    manifest.readingProgression =
      epubHelper.readingDirection() == DIR.LTR ? TextDirection.LTR : TextDirection.RTL
    manifest.readingOrder = []
    const list = epubHelper.readingOrderList
    for (const item of list) {
      manifest.readingOrder.push(item.resourceItem.href)
    }
    manifest.resources = []
    const epubResourceList = epubHelper.epub.epubPackage.manifest.items
    for (const item of epubResourceList) {
      const resource: LinkedResource = {
        url: item.href,
        encodingFormat: item.mediaType,
      }
      manifest.resources.push(resource)
    }
    if (epubHelper.nav) {
      manifest.toc = epubHelper.nav.href
    } else if (epubHelper.toc) {
      manifest.toc = epubHelper.toc.href
    }
    if (epubHelper.coverImage) {
      manifest.coverImage = epubHelper.coverImage.href
    }
    return manifest
  }
}
