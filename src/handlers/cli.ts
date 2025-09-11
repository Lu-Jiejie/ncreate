import type { TemplateItem } from '../config'
import type { HistoryItem } from '../history'
import type { Options } from '../options'
import { basename } from 'node:path'
import process from 'node:process'
import rawPrompts from 'prompts-plus'
import { getConfig } from '../config'
import { getHistory } from '../history'
import { printSuccess } from '../printer'
import { timeDifference } from '../utils'
import { handlerGitHub } from './github'
import { handlerLocal } from './local'
import { handlerNPM } from './npm'

function prompts<T>(questions: rawPrompts.PromptObject) {
  return rawPrompts<T>(questions, {
    onCancel: () => { process.exit(0) },
  })
}

function getInitialDestinationDir(templateName: string) {
  const regexp = /^(?:(?:https:\/\/)?github.com\/)?(?<author>[^/\s]+)\/(?<repoName>[^/\s#]+)(?<path>(?:\/[^/\s#]+)+)?\/?(?:#(?<ref>.+))?/
  const match = regexp.exec(templateName)
  if (!match)
    return templateName
  return match.groups?.subdir ? basename(match.groups.subdir) : match.groups!.repoName
}

async function selectGitHubTemplate(history: HistoryItem[], options: Options) {
  const gitHubHistory = history.filter(item => item.type === 'github').sort((a, b) => b.timestamp - a.timestamp)
  const choices = gitHubHistory.map(item => ({ title: item.templateName, value: item.templateName, description: `Last used: ${timeDifference(item.timestamp)}` }))

  const { templateName } = await prompts<string>({
    type: 'select',
    name: 'templateName',
    message: 'Select the GitHub template to create',
    choices,
  })

  const { destinationDir } = await prompts<string>({
    type: 'text',
    name: 'destinationDir',
    message: 'Enter the destination directory',
    initial: getInitialDestinationDir(templateName),
  })

  handlerGitHub(templateName, destinationDir, options)
}

async function selectNPMTemplate(history: HistoryItem[], options: Options) {
  const npmHistory = history.filter(item => item.type === 'npm').sort((a, b) => b.timestamp - a.timestamp)
  const choices = npmHistory.map(item => ({ title: item.templateName, value: item.templateName, description: `Last used: ${timeDifference(item.timestamp)}` }))

  const { templateName } = await prompts<string>({
    type: 'select',
    name: 'templateName',
    message: 'Select the NPM template to create',
    choices,
  })

  const { destinationDir } = await prompts<string>({
    type: 'text',
    name: 'destinationDir',
    message: 'Enter the destination directory',
    initial: getInitialDestinationDir(templateName),
  })

  handlerNPM(templateName, destinationDir, options)
}

async function selectLocalTemplate(history: HistoryItem[], localTemplates: TemplateItem[], options: Options) {
  const localHistory = history.filter(item => item.type === 'local').sort((a, b) => b.timestamp - a.timestamp)
  const choices = []
  const historySet = new Set(localHistory.map(item => item.templateName))

  choices.push(...localHistory.map(item => ({ title: item.templateName, value: item.templateName, description: `Last used: ${timeDifference(item.timestamp)}` })))
  choices.push(...localTemplates.filter(item => !historySet.has(item.name)).map(item => ({ title: item.name, value: item.name, description: 'Last used: None' })))

  const { templateName } = await prompts<string>({
    type: 'select',
    name: 'templateName',
    message: 'Select the local template to create',
    choices,
  })

  const { destinationDir } = await prompts<string>({
    type: 'text',
    name: 'destinationDir',
    message: 'Enter the destination directory',
    initial: getInitialDestinationDir(templateName),
  })

  handlerLocal(templateName, destinationDir, options)
}

export async function handlerCli(options: Options) {
  const localTemplates = (getConfig()).localTemplates || []
  const history = (await getHistory()) || []

  if (localTemplates.length === 0 && history.length === 0)
    throw new Error('No local templates or history found')

  printSuccess('No template name provided, running CLI to choose template from history')

  const typeChoices = []
  if (history.length && history.some(item => item.type === 'npm'))
    typeChoices.push({ title: 'NPM Templates', value: 'npm' })
  if (history.length && history.some(item => item.type === 'github'))
    typeChoices.push({ title: 'GitHub Templates', value: 'github' })
  if (localTemplates.length)
    typeChoices.push({ title: 'Local Templates', value: 'local' })
  const { type } = await prompts<'github' | 'npm' | 'local'>({
    type: 'select',
    name: 'type',
    message: 'Select the type of template to create',
    choices: typeChoices,
  })
  switch (type) {
    case 'github':
      selectGitHubTemplate(history, options)
      break
    case 'npm':
      selectNPMTemplate(history, options)
      break
    case 'local':
      selectLocalTemplate(history, localTemplates, options)
      break
  }
}
