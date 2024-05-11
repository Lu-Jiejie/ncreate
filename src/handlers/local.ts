import { printSuccess } from '../printer'
import { copyFolderFiles } from '../utils'

export async function handlerLocal(templateName: string, templatePath: string, destination: string) {
  printSuccess(`Creating project from local template: ${templateName}`)
  destination = destination || templateName
  await copyFolderFiles(templatePath, destination, ['.git', 'node_modules'])
}
