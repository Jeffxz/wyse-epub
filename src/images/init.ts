import { WyseConfig } from '../data/WyseConfig'
import * as path from 'path'
import { WYSE_JSON } from '../data/WyseManifest'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
const chalk = require('chalk')

const initImageFolder = (folder: string) => {
  const config: WyseConfig = {
    title: 'Book title goes here',
    author: 'Auth name goes here',
    bookId: `wyse:${randomUUID()}`,
    language: 'en',
    height: 1920,
  }
  const filePath = path.join(folder, WYSE_JSON)
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath)
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
    console.log(chalk.green(`Congrats! Next you can modify ${filePath} then start resizing images or converting to epub file.`))
  } catch (error) {
    console.log(chalk.red(error))
  }
}

export default initImageFolder
