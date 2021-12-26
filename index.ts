#!/usr/bin/env node

import { Command } from 'commander'
import ManifestGenerator from './src/ManifestGenerator'

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
    console.log('wyse pack is called with params: ' + folder)
  })

program.parse()
