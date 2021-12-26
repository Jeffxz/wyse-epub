#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()

const initCmd = program.command('init')
initCmd
  .argument('<folder>', 'folder to scan and initialize wyse.json')
  .action((folder) => {
    console.log('wyse init is called with params: ' + folder)
  })

const packCmd = program.command('pack')
packCmd
  .argument('<folder>', 'folder package epub file')
  .action((folder) => {
    console.log('wyse pack is called with params: ' + folder)
  })

program.parse()
