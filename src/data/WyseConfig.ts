export interface SimpleToc {
  title: string
  pageIndex: number
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
}
