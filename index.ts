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

const packCmd = program.command('pack')
packCmd
  .argument('<folder>', 'folder package epub file')
  .action((folder) => {
    const packager = new EpubPackager()
    packager.pack(folder)
  })

program.parse()
