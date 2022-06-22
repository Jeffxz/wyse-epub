export interface SimpleToc {
  title: string
  pageIndex: number
}

export interface RegionLink {
  coords: string
  url: string
}

export interface PageRegionLink {
  pageIndex: number
  links: RegionLink[]
}

export interface WyseConfig {
  title: string
  bookId: string
  description?: string
  author: string
  publisher?: string
  language: string
  coverImage?: string
  outputFile?: string
  width?: number
  height?: number
  isRTL?: boolean
  isFXL?: boolean
  isFirstPageCentered?: boolean
  startPage?: number
  tableOfContents?: SimpleToc[]
  pageRegionLinks?: PageRegionLink[]
}
