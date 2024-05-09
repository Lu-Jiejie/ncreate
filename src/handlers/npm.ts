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
  if (!agent) {
    printError('No agent selected.')
    return
  }

  const command = `${agent} create ${templateName} ${destination}`.trim()
  console.log(process.cwd())
  try {
    await execa(command, { stdio: 'inherit' })
  }
  catch (error: any) {
    printError(error.message)
  }
}
