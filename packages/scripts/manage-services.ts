#!/usr/bin/env node
import { Command } from 'commander'
import { serviceManager } from './service-manager.js'

const program = new Command()

program
  .name('manage-services')
  .description('Manage development services')
  .version('1.0.0')

program
  .command('start')
  .description('Start all services')
  .action(async () => {
    await serviceManager.startAll()
  })

program
  .command('stop')
  .description('Stop all services')
  .action(async () => {
    await serviceManager.stopAll()
  })

program.parse()
