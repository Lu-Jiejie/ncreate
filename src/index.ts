import { pathToFileURL } from 'node:url'
import { getConfig } from './config'
import { CACHE_DIR, CONFIG_FILE_PATH } from './constants'

const res = await getConfig()
console.log(res)
