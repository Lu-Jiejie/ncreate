import process from 'node:process'
import { printError, printHelp, printVersion } from './printer'
import { handlerNPM } from './handlers/npm'
import { handlerGitHub } from './handlers/github'
import { getConfig } from './config'
import { handlerLocal } from './handlers/local'
import { handlerCli } from './handlers/cli'

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  printError(error.message)
})

async function runner(args: string[]) {
  // if no template name provided, run cli to choose template from history
  if (args.length === 0) {
    await handlerCli()
    return
  }

  if (args.includes('-v') || args.includes('-V') || args.includes('--version')) {
    printVersion()
    return
  }

  if (args.includes('-h') || args.includes('--help')) {
    printHelp()
    return
  }

  const localTemplates = (await getConfig()).localTemplates || []
  const templateName = args[0]
  const destinationDir = args[1]

  // if local template
  const localIndex = localTemplates.findIndex(template => template.name === templateName)
  if (localIndex !== -1) {
    const templatePath = localTemplates[localIndex].path
    handlerLocal(templateName, templatePath, destinationDir)
    return
  }

  if (templateName.includes('/'))
    handlerGitHub(templateName, destinationDir)
  else
    handlerNPM(templateName, destinationDir)
}

function run() {
  const args = process.argv.slice(2).filter(Boolean)
  runner(args)
}

run()
