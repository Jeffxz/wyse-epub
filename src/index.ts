#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './packager/ManifestGenerator'
import EpubPackager from './packager/EpubPackager'
import * as appData from '../package.json'
import convertMarkdown from './converter/Markdown'
import convertText from './converter/Text'
import convertMobi from './converter/Mobi'
import * as fs from 'fs'
import { WYSE_JSON } from './packager/WyseManifest'
import initImageFolder from './images/init'
import resizeImages from './images/resize'
import convertImages from './images/convert'

const program = new Command()

const infoCmd = program.command('info')
infoCmd.action(() => {
  console.log(appData.version)
})

const initCmd = program.command('init')
initCmd
  .argument('<folder>', 'folder to scan and initialize wyse.json')
  .action((folder) => {
    console.log(appData.version)
    const generator = new ManifestGenerator()
    const manifest = generator.scanFolder(folder)
    generator.saveManifest(folder, manifest)
  })

const prepCmd = program.command('init-epub')
prepCmd
  .argument('<folder>', 'creat folder for epub meta files')
  .option('-f, --force', 'force overwrite existing epub meta files')
  .action((folder, options) => {
    console.log('using wyse version:', appData.version)
    const packager = new EpubPackager()
    packager.createEpubPackage(folder, options.force)
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

const packCmd = program.command('pack')
packCmd
  .argument('<folder>', 'package epub file from folder')
  .action((folder) => {
    console.log('using wyse version:', appData.version)
    const packager = new EpubPackager()
    packager.pack(folder)
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

program.parse()
