import process from 'node:process'
import minimist from 'minimist'
import { printError, printHelp, printVersion } from './printer'
import { handlerNPM } from './handlers/npm'
import { handlerGitHub } from './handlers/github'
import { getConfig } from './config'
import { handlerLocal } from './handlers/local'
import { handlerCli } from './handlers/cli'
import type { Options } from './options'

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  printError(error.message)
})

async function runner(args: minimist.ParsedArgs) {
  if (args.version) {
    printVersion()
    return
  }

  if (args.help) {
    printHelp()
    return
  }

  const localTemplates = (await getConfig()).localTemplates || []
  const templateName = args._[0]
  const destinationDir = args._[1]
  const options: Options = { force: args.force }

  // if no template name provided, run cli to choose template from history
  if (args._.length === 0) {
    await handlerCli(options)
    return
  }

  // if local template
  const localIndex = localTemplates.findIndex(template => template.name === templateName)
  if (localIndex !== -1) {
    const templatePath = localTemplates[localIndex].path
    handlerLocal(templateName, templatePath, destinationDir, options)
    return
  }

  if (templateName.includes('/'))
    handlerGitHub(templateName, destinationDir, options)
  else
    handlerNPM(templateName, destinationDir, options)
}

function run() {
  const args = minimist(process.argv.slice(2), {
    alias: {
      v: 'version',
      V: 'version',
      h: 'help',
      H: 'help',
    },
  })
  runner(args)
}

run()
