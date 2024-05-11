import { pathToFileURL } from 'node:url'
import { CONFIG_FILE_PATH } from './constants'

export interface Config {
  agent?: string
  localTemplates?: {
    name: string
    path: string
  }[]
}

let config: Config
export async function getConfig() {
  if (!config) {
    try {
      const rawConfig = await import(pathToFileURL(CONFIG_FILE_PATH).href)
      config = rawConfig.default
    }
    catch (error) {
      config = {}
    }
  }
  return config
}
