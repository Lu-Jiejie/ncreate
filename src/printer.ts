import pc from 'picocolors'
import { name, version } from '../package.json'

export function printVersion() {
  console.log(`${pc.bold(pc.green(name))} ${pc.green(`v${version}`)}`)
}

export function printHelp() {
  console.log(`${pc.bold(pc.green(name))} ${pc.green(`v${version}`)}`)
}

export function printError(errorMessage: string, errorType: string = 'ERROR') {
  console.log(`${pc.inverse(pc.red(` ${errorType} `))} ${pc.red(errorMessage)}`)
}
