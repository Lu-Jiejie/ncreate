import process from 'node:process'
import prompts from 'prompts-plus'
import { execa } from 'execa'
import { printError, printSuccess, printWarning } from '../printer'
import { getConfig } from '../config'

export async function handlerNPM(templateName: string, destination: string) {
  printSuccess(`Creating project from NPM template: ${templateName}`)
  destination = destination || templateName
  let agent = (await getConfig()).agent
  if (!agent || !['npm', 'pnpm', 'yarn', 'bun'].includes(agent)) {
    agent = (await prompts({
      type: 'select',
      name: 'agent',
      message: 'Choose an agent',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' }
      ]
    })).agent
    if (!agent)
      throw new Error('No agent selected')
  }

  const command = `${agent} create ${templateName} ${destination}`.trim()

  await execa(command, { stdio: 'inherit' })
}
