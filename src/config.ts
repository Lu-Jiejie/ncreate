import { pathToFileURL } from 'node:url'
import { CONFIG_FILE_PATH } from './constants'

export interface Config {
  localTemplates?: {
    name: string
    path: string
  }[]
}

export async function getConfig() {
  const rawConfig = await import(pathToFileURL(CONFIG_FILE_PATH).href)
  const config: Config = rawConfig.default
  return config
}
