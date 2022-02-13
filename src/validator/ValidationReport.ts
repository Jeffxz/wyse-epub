import { Epub } from 'epub-object-ts'

export type ValidationReport = {
  validationToolVersion: string,
  epubPath: string,
  epubVersion?: string,
  epub?: Epub,
  error?: [],
  warning?: []
}
