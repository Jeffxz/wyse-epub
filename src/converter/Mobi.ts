import * as path from 'path'
import * as fs from 'fs'
import { MobiFile } from 'mobi-object-ts'

const convertMobi = (mobiFile: string) => {
  const absoluteFilePath = mobiFile.startsWith(path.sep)
    ? mobiFile
    : path.join(process.cwd(), mobiFile)
  const buffer = fs.readFileSync(absoluteFilePath)
  const mobi = new MobiFile(buffer.buffer)
  mobi.load()
  console.log(mobi.read_text())
}

export default convertMobi
