import { WyseConfig } from '../data/WyseConfig'
import * as path from 'path'
import { WYSE_JSON } from '../packager/WyseManifest'
import * as fs from 'fs'
import imageSize from 'image-size'
import { convert } from 'imagemagick'
import { charsets } from 'mime-types'
import lookup = charsets.lookup
const chalk = require('chalk')

const resizeImages = (folder: string, configPath?: string) => {
  let configFilePath = ''
  let inputFolderName = folder
  if (inputFolderName.endsWith(path.sep)) {
    inputFolderName = inputFolderName.slice(0, -1)
  }
  const outputFolderName = `${inputFolderName}_output`
  if (!configPath) {
    configFilePath = path.join(inputFolderName, WYSE_JSON)
    if (!fs.existsSync(configFilePath)) {
      console.log(chalk.red('Can not find config file, please run "wyse images -i" at first.'))
    }
  } else {
    configFilePath = configPath
  }
  try {
    if (fs.existsSync(outputFolderName)) {
      fs.rmdirSync(outputFolderName)
    }
    fs.mkdirSync(outputFolderName)
    const data = fs.readFileSync(configFilePath, {encoding: 'utf-8'})
    const configJson = JSON.parse(data) as WyseConfig
    if (!configJson.width || configJson.width <= 10) {
      console.log(chalk.red('needs width to be specified and larger than 10 to continue. We recommend to use image with width larger than 800 for digital book.'))
      return
    }
    const imageWidth = configJson.width as number
    let files = fs.readdirSync(inputFolderName)
    files = files.filter((name)=> {
      return name !== WYSE_JSON
    })
    files.sort((a, b) => {
      return a.length - b.length
    })
    const fileListSize = files.length
    let maxLength = fileListSize.toString().length
    files.forEach((fileName, index) => {
      const filePath = path.join(inputFolderName, fileName)
      const ext = path.extname(filePath)
      const imageFileName = `image_${index.toString().padStart(maxLength, '0')}`
      let outputPath = path.join(outputFolderName, imageFileName)
      outputPath += ext
      console.log(filePath)
      const imageDimensions = imageSize(filePath)
      if (imageDimensions.width && imageDimensions.height) {
        const ratio = imageWidth / imageDimensions.width
        let imageHeight = imageDimensions.height * ratio
        imageHeight = Math.round(imageHeight)
        console.log(`converting image ${fileName} from size ${imageDimensions.width} x ${imageDimensions.height} to ${imageWidth} x ${imageHeight} and saving to ${outputPath}`)
        convert([filePath, '-resize', `${imageWidth}x${imageHeight}`, outputPath], (error, output) => {
          if (error) {
            throw error
          }
        })
      } else {
        throw (`failed to detect original image size ${fileName}. Is it an image?`)
      }
    })
  } catch (error) {
    console.log(chalk.red(error))
  }
}

export default resizeImages
