#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './ManifestGenerator'
import EpubPackager from './EpubPackager'
import * as appData from '../package.json'

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
    console.log(appData.version)
    const packager = new EpubPackager()
    packager.pack(folder, options.force)
  })

program.parse()
