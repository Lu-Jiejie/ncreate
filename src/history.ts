import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { HISTORY_FILE_PATH } from './constants'

export interface HistoryItem {
  type: 'npm' | 'github' | 'local'
  templateName: string
  timestamp: number
}

export async function getHistory() {
  try {
    const history: HistoryItem[] = (await import(pathToFileURL(HISTORY_FILE_PATH).href)).history
    return history
  }
  catch {
    return []
  }
}

export async function saveHistory(history: HistoryItem[]) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify({ history }, null, 2)
    writeFile(HISTORY_FILE_PATH, json)
      .then(() => resolve(true))
      .catch(error => reject(error))
  })
}

export async function updateHistoryItem(historyItem: HistoryItem) {
  const history = await getHistory()
  const historyItemIndex = history.findIndex(item => item.type === historyItem.type && item.templateName === historyItem.templateName)
  if (historyItemIndex !== -1)
    history[historyItemIndex] = historyItem
  else
    history.unshift(historyItem)
  await saveHistory(history)
}
