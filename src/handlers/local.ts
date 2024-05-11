import { copyFolderFiles } from '../utils'

export async function handlerLocal(templateName: string, templatePath: string, destination: string) {
  await copyFolderFiles(templatePath, destination, ['.git', 'node_modules'])
}
