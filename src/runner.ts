import process from 'node:process'
import { printError, printHelp, printVersion } from './printer'
import { handlerNPM } from './handlers/npm'
import { handlerGitHub } from './handlers/github'
import { getConfig } from './config'
import { handlerLocal } from './handlers/local'

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  printError(error.message)
})

async function run(args: string[]) {
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

  const config = await getConfig()
  const localTemplates = config.localTemplates || []
  const templateName = args[0]
  const destination = args[1] || '.'

  // if local template
  const localIndex = localTemplates.findIndex(template => template.name === templateName)
  if (localIndex !== -1) {
    const templatePath = localTemplates[localIndex].path
    handlerLocal(templateName, templatePath, destination)
    return
  }

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
