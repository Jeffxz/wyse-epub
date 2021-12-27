#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './src/ManifestGenerator'
import EpubPackager from './src/EpubPackager'

const program = new Command()

const initCmd = program.command('init')
initCmd
  .argument('<folder>', 'folder to scan and initialize wyse.json')
  .action((folder) => {
    const generator = new ManifestGenerator()
    const manifest = generator.scanFolder(folder)
    generator.saveManifest(folder, manifest)
  })

const prepCmd = program.command('create-epub-meta')
prepCmd
  .argument('<folder>', 'creat folder for epub meta files')
  .option('-f, --force', 'force overwrite existing epub meta files')
  .action((folder, options) => {
    const packager = new EpubPackager()
    packager.pack(folder, options.force)
  })

program.parse()
