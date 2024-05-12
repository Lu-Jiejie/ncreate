import { homedir } from 'node:os'
import { join } from 'node:path'

export const CACHE_DIR = join(homedir(), '.ncreate')
export const CONFIG_FILE_PATH = join(CACHE_DIR, 'config.json')
export const HISTORY_FILE_PATH = join(CACHE_DIR, 'history.json')
