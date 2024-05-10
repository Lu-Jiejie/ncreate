import { homedir } from 'node:os'
import { resolve } from 'node:path'

export const DEBUG_SIGN = '?'
export const CACHE_DIR = resolve(homedir(), '.ncreate')
