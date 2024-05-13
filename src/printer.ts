/* eslint-disable no-console */
import pc from 'picocolors'
import { name, version } from '../package.json'

export function printVersion() {
  console.log(`${pc.bold(pc.green(name))} ${pc.green(`v${version}`)}`)
}

export function printHelp() {
  console.log(`${pc.bold(pc.green(name))} ${pc.green(`v${version}`)}`)
  console.log('')
  console.log('Usage:')
  console.log(`  $ ncreate                              ${pc.gray('- Start the interactive mode')}`)
  console.log(`  $ ncreate <template> [<destination>]   ${pc.gray('- Create a new project from a template')}`)
  console.log('')
  console.log('Template Types:')
  console.log(`  ${'npm'}     ${pc.gray('- An npm template')}`)
  console.log(`          ${pc.gray('  E.g. $ ncreate vue@latest my-vue-app')}`)
  console.log(`  ${'github'}  ${pc.gray('- A GitHub repositorys')}`)
  console.log(`          ${pc.gray('  E.g. $ ncreate XXXX/ts-starter my-ts-app')}`)
  console.log(`  ${'local'}   ${pc.gray('- A local directory you have set up as a template')}`)
  console.log('')
  console.log(pc.yellow('Check https://github.com/Lu-Jiejie/ncreate for more information.'))
}

export function printError(errorMessage: string, errorType: string = 'ERROR') {
  console.log(`${pc.inverse(pc.red(` ${errorType} `))} ${pc.red(errorMessage)}`)
}

export function printSuccess(message: string) {
  console.log(`${pc.inverse(pc.green(' SUCCESS '))} ${pc.green(message)}`)
}

export function printWarning(message: string) {
  console.log(`${pc.inverse(pc.yellow(' WARNING '))} ${pc.yellow(message)}`)
}
