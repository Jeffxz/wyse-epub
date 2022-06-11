import * as fs from 'fs'
import { exec } from 'child_process'
const chalk = require('chalk')

const packFolderToEpub = (folder: string, epubPath: string) => {
  if (!epubPath) {
    console.log(chalk.red('format: wyse pack <input> -o <epub path>'))
    return
  }
  const inputFolderPath = folder
  if (fs.existsSync(epubPath)) {
    fs.rmSync(epubPath)
  }
  const fileList = fs.readdirSync(inputFolderPath)
  const newList = fileList.filter((fileName) => {
    return fileName !== 'mimetype' && fileName !== 'META-INF' && !fileName.startsWith('.')
  })
  const excludeList = fileList.filter((fileName) => {
    return fileName.startsWith('.')
  })
  let cmd = `pushd ${inputFolderPath}; zip -rX ${epubPath} mimetype META-INF ${newList.join(' ')}; popd`
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.red(error))
    }
  })
}

export default packFolderToEpub
