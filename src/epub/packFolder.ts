import * as fs from 'fs'
import { exec } from 'child_process'
import * as path from 'path'
const chalk = require('chalk')

const packFolderToEpub = (folder: string, epubPath: string, callback?: (output:string) => void, onError?: (output:string) => void) => {
  if (!epubPath) {
    console.log(chalk.red('format: wyse epub -p <input> -o <epub path>'))
    return
  }
  const inputFolderPath = folder.startsWith(path.sep) ? folder : path.join(process.cwd(), folder)
  let outputEpubPath = epubPath.startsWith(path.sep) ? epubPath : path.join(process.cwd(), epubPath)
  if (fs.existsSync(outputEpubPath)) {
    fs.rmSync(outputEpubPath)
  }
  console.log(chalk.green(`packaging folder ${inputFolderPath} to epub file ${outputEpubPath}`))
  const fileList = fs.readdirSync(inputFolderPath)
  const newList = fileList.filter((fileName) => {
    return fileName !== 'mimetype' && fileName !== 'META-INF' && !fileName.startsWith('.')
  })
  const excludeList = fileList.filter((fileName) => {
    return fileName.startsWith('.')
  })
  let cmd = `cd ${inputFolderPath}; zip -rX ${outputEpubPath} mimetype META-INF ${newList.join(' ')}`
  exec(cmd, (error, stdout, stderr) => {
    if (callback) {
      callback(outputEpubPath)
    }
    if (error) {
      if (onError) {
        onError(error.message)
      }
      console.log(chalk.red(error))
    }
  })
}

export default packFolderToEpub
