import { updateHistoryItem } from '../history'
import { type Options, defaultOptions } from '../options'
import { printSuccess } from '../printer'
import { copyDir, isDirEmpty } from '../utils'

export async function handlerLocal(templateName: string, templatePath: string, destinationDir: string, options: Options = defaultOptions) {
  printSuccess(`Creating project from local template: ${templateName}`)

  if (!options.force && !isDirEmpty(destinationDir))
    throw new Error('Destination directory is not empty, use --force to override')

  destinationDir = destinationDir || templateName
  await copyDir(templatePath, destinationDir, ['.git', 'node_modules'])
  // save history
  updateHistoryItem({
    type: 'local',
    templateName,
    timestamp: Date.now(),
  })
}
