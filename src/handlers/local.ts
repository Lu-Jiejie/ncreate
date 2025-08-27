import type { Options } from '../options'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gitignoreToMinimatch } from 'gitignore-to-minimatch'
import { getConfig } from '../config'
import { updateHistoryItem } from '../history'
import { defaultOptions } from '../options'
import { printSuccess } from '../printer'
import { copyDir, isDirEmpty } from '../utils'

export async function handlerLocal(templateName: string, destinationDir: string, options: Options = defaultOptions) {
  printSuccess(`Creating project from local template: ${templateName}`)

  if (!options.force && !isDirEmpty(destinationDir))
    throw new Error('Destination directory is not empty, use --force to override')

  const config = await getConfig()
  const template = config.localTemplates?.find(t => t.name === templateName)
  destinationDir = destinationDir || templateName
  if (!template?.path)
    throw new Error(`Local template not found: ${templateName}`)

  let exclude: string[]
  if (template.exclude) {
    exclude = template.exclude
  }
  else {
    try {
      exclude = (await readFile(join(template.path, '.gitignore'), 'utf-8')).split('\n').map(l => l.trim()).filter(Boolean)
    }
    catch {
      exclude = []
    }
  }
  await copyDir(template.path, destinationDir, [...exclude, '.git'].map(gitignoreToMinimatch).flat())
  // save history
  updateHistoryItem({
    type: 'local',
    templateName,
    timestamp: Date.now(),
  })
}
