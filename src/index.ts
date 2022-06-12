#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './epub/ManifestGenerator'
import EpubPackager from './epub/EpubPackager'
import * as appData from '../package.json'
import convertMarkdown from './converter/Markdown'
import convertText from './converter/Text'
import convertMobi from './converter/Mobi'
import { WYSE_JSON } from './data/WyseManifest'
import initImageFolder from './images/init'
import resizeImages from './images/resize'
import convertImages from './images/convert'
import packFolderToEpub from './epub/packFolder'
import createEpubFolder from './epub/createFolder'
const chalk = require('chalk')

const program = new Command()
program.name('wyse')
  .description('Wysebee CLI digital book toolkit')
  .version(appData.version)

const createEpubCmd = program.command('epub')
createEpubCmd
  .argument('<folder>', 'creat folder for epub meta files')
  .option('-c, --config <json>', 'path of WyseConfig json file')
  .option('-i, --init', 'initialize epub folder')
  .option('-o, --output <epub>', 'output epub file name. Use with "-p"')
  .option('-p, --pack', 'package epub file from folder')
  .option('-t, --template <template>', 'template used to create epub folder')
  .action((folder, options) => {
    if (options.init) {
      console.log('initialize an epub folder')
      createEpubFolder(folder, options.template, options.config)
    } else if (options.pack) {
      console.log('using wyse version:', appData.version)
      packFolderToEpub(folder, options.output)
    }
  })

const epub2JsonCmd = program.command('epub2json')
epub2JsonCmd
  .argument('<epub>', 'epub single file name or folder of extracted epub file')
  .option('-f, --force', 'force overwrite wyse.json')
  .action((epub, options) => {
    console.log('using wyse version:', appData.version)
    const generator = new ManifestGenerator()
    generator.epubToManifest(epub, WYSE_JSON)
  })

const markdownCmd = program.command('markdown')
markdownCmd
  .argument('<file>', 'package epub file from a single markdown file')
  .action((file) => {
    console.log('using wyse version:', appData.version)
    convertMarkdown(file)
  })

const textCmd = program.command('text')
textCmd
  .argument('<file>', 'package epub file from a single text file')
  .action((file) => {
    console.log('wyse version:', appData.version)
    convertText(file)
  })

const mobiCmd = program.command('mobi')
mobiCmd
  .argument('<file>', 'package epub file from a mobi file')
  .action((file) => {
    console.log('using wyse version:', appData.version)
    convertMobi(file)
  })

const imagesCmd = program.command('images')
imagesCmd
  .argument('<folder>', 'Epub toolkit for Images')
  .option('-i, --init', 'generate WyseConfig file')
  .option('-r, --resize', 'resize images from input folder')
  .option('-c, --config <configFilePath>', 'path of WyseConfig json file')
  .action((folder, options) => {
    console.log('using wyse version:', appData.version)
    if (options.init) {
      initImageFolder(folder)
    } else if (options.resize) {
      resizeImages(folder, options.config)
    } else {
      convertImages(folder, options.config)
    }
  })

try {
  program.parse(process.argv)
} catch (error) {
}
