#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './packager/ManifestGenerator'
import EpubPackager from './packager/EpubPackager'
import * as appData from '../package.json'
import convertMarkdown from './converter/Markdown'
import convertText from './converter/Text'
import validate from './validator'

const program = new Command()

const initCmd = program.command('init')
initCmd
  .argument('<folder>', 'folder to scan and initialize wyse.json')
  .action((folder) => {
    console.log(appData.version)
    const generator = new ManifestGenerator()
    const manifest = generator.scanFolder(folder)
    generator.saveManifest(folder, manifest)
  })

const prepCmd = program.command('create-epub')
prepCmd
  .argument('<folder>', 'creat folder for epub meta files')
  .option('-f, --force', 'force overwrite existing epub meta files')
  .action((folder, options) => {
    console.log('wyse version:', appData.version)
    const packager = new EpubPackager()
    packager.createEpubPackage(folder, options.force)
  })

const packCmd = program.command('pack')
packCmd
  .argument('<folder>', 'package epub file from folder')
  .action((folder) => {
    console.log('wyse version:', appData.version)
    const packager = new EpubPackager()
    packager.pack(folder)
  })

const validatorCmd = program.command('check')
validatorCmd
  .argument('<epub>', 'validate epub file or folder path')
  .action((epub) => {
    console.log('wyse version:', appData.version)
    validate(epub, {mode: 'strict'})
  })

const markdownCmd = program.command('markdown')
markdownCmd
  .argument('<file>', 'package epub file from a single markdown file')
  .action((file) => {
    console.log('wyse version:', appData.version)
    convertMarkdown(file)
  })

const textCmd = program.command('text')
textCmd
  .argument('<file>', 'package epub file from a single text file')
  .action((file) => {
    console.log('wyse version:', appData.version)
    convertText(file)
  })

program.parse()
