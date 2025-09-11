import { createRequire } from 'node:module'
import { CONFIG_FILE_PATH } from './constants'

const require = createRequire(import.meta.url)

export interface TemplateItem {
  name: string
  path: string
  exclude?: string[]
}

export interface Config {
  agent?: string
  localTemplates?: TemplateItem[]
}

let config: Config | null = null
export function getConfig() {
  if (!config) {
    try {
      const rawConfig = require(CONFIG_FILE_PATH)
      config = rawConfig && typeof rawConfig === 'object' ? rawConfig as Config : {}
    }
    catch (error) {
      config = {}
      console.error('Error loading config:', error)
    }
  }
  return config
}
