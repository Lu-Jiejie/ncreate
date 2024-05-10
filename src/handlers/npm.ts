import process from 'node:process'
import prompts from 'prompts-plus'
import { execa } from 'execa'
import { printError } from '../printer'

export async function handlerNPM(templateName: string, destination: string) {
  const { agent }: { agent: string } = await prompts({
    type: 'select',
    name: 'agent',
    message: 'Choose an agent',
    choices: [
      { title: 'npm', value: 'npm' },
      { title: 'pnpm', value: 'pnpm' },
      { title: 'yarn', value: 'yarn' },
      { title: 'bun', value: 'bun' }
    ]
  })
  if (!agent)
    throw new Error('No agent selected')

  const command = `${agent} create ${templateName} ${destination}`.trim()

  await execa(command, { stdio: 'inherit' })
}
