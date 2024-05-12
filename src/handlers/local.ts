import { updateHistoryItem } from '../history'
import { printSuccess } from '../printer'
import { copyFolderToFolder } from '../utils'

export async function handlerLocal(templateName: string, templatePath: string, destinationDir: string) {
  printSuccess(`Creating project from local template: ${templateName}\n`)
  destinationDir = destinationDir || templateName
  await copyFolderToFolder(templatePath, destinationDir, ['.git', 'node_modules'])
  // save history
  updateHistoryItem({
    type: 'local',
    templateName,
    timestamp: Date.now(),
  })
}
