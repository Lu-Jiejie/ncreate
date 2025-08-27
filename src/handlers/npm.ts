import type { Options } from '../options'
import { execa } from 'execa'
import prompts from 'prompts-plus'
import { getConfig } from '../config'
import { updateHistoryItem } from '../history'
import { defaultOptions } from '../options'
import { printSuccess } from '../printer'
import { isDirEmpty } from '../utils'

export async function handlerNPM(templateName: string, destinationDir: string, options: Options = defaultOptions) {
  printSuccess(`Creating project from NPM template: ${templateName}`)

  if (!options.force && !isDirEmpty(destinationDir))
    throw new Error('Destination directory is not empty, use --force to override')

  destinationDir = destinationDir || templateName
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
        { title: 'bun', value: 'bun' },
      ],
    })).agent
    if (!agent)
      throw new Error('No agent selected')
  }

  const command = `${agent} create ${templateName} ${destinationDir}`.trim()

  await execa(command, { stdio: 'inherit' })

  // save history
  updateHistoryItem({ type: 'npm', templateName, timestamp: Date.now() })
}
