import process from 'node:process'
import { DEBUG_SIGN } from './constants'
import { remove } from './utils'
import { printError, printHelp, printVersion } from './printer'
import { handlerNPM } from './handlers/npm'
import { handlerGitHub } from './handlers/github'

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  printError(error.message)
})

function run(args: string[]) {
  const debug = args.includes(DEBUG_SIGN)
  if (debug)
    remove(args, DEBUG_SIGN)

  if (args.length === 0)
    throw new Error('No Template Name Provided')

  if (args.length === 1 && (args[0].toLowerCase() === '-v' || args[0] === '--version')) {
    printVersion()
    return
  }

  if (args.length === 1 && (args[0].toLowerCase() === '-h' || args[0] === '--help')) {
    printHelp()
    return
  }

  const templateName = args[0]
  const destination = args[1] || '.'

  if (templateName.includes('/'))
    handlerGitHub(templateName, destination)
  else
    handlerNPM(templateName, destination)
}

function runCli() {
  const args = process.argv.slice(2).filter(Boolean)
  run(args)
}

runCli()
