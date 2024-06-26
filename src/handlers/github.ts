import { basename, dirname, join } from 'node:path'
import { accessSync, mkdirSync } from 'node:fs'
import { env } from 'node:process'
import { execaCommand } from 'execa'
import * as tar from 'tar'
import { CACHE_DIR } from '../constants'
import { fetchFile, isDirEmpty } from '../utils'
import { printSuccess } from '../printer'
import { updateHistoryItem } from '../history'
import { type Options, defaultOptions } from '../options'

interface RepoInfo {
  author: string
  repoName: string
  subdir: string
  ref: string
  url: string
}

interface RepoRef {
  type: string
  name: string
  hash: string
}

function parseRepoInfo(source: string): RepoInfo {
  const regexp = /^(?:(?:https:\/\/)?github.com\/)?(?<author>[^\/\s]+)\/(?<repoName>[^\/\s#]+)(?<subdir>(?:\/[^\/\s#]+)+)?(?:\/)?(?:#(?<ref>.+))?/
  const match = regexp.exec(source)
  if (!match)
    throw new Error('Invalid GitHub repository format')

  const author = match.groups!.author
  const repoName = match.groups!.repoName
  const subdir = match.groups?.subdir || ''
  const ref = match.groups?.ref || 'HEAD'
  const url = `https://github.com/${author}/${repoName}`

  return { author, repoName, subdir, ref, url }
}

async function fetchRepoRefs(repoUrl: string): Promise<RepoRef[]> {
  const { stdout } = await execaCommand(`git ls-remote ${repoUrl}`)
  const refs = stdout.split('\n').filter(Boolean).map((line) => {
    const [hash, ref] = line.split('\t')

    if (ref === 'HEAD')
      return { type: 'HEAD', name: 'HEAD', hash }

    const match = ref.match(/refs\/(.+)\/(.+)/)
    if (!match)
      throw new Error(`Invalid repository reference: ${ref}`)
    return {
      type: match[1] === 'tags' ? 'tag' : match[1] === 'heads' ? 'branch' : match[1],
      name: match[2],
      hash,
    }
  })
  return refs
}

function getRepoHash(repoInfo: RepoInfo, repoRefs: RepoRef[]): string {
  // default to HEAD
  if (repoInfo.ref === 'HEAD')
    return repoRefs.find(ref => ref.type === 'HEAD')!.hash

  // if ref is a tag or branch
  // if ref is a commit hash
  const hash = repoRefs.find((ref) => {
    if (ref.name === repoInfo.ref)
      return true
    if (repoInfo.ref.length >= 7 && ref.hash.startsWith(repoInfo.ref))
      return true
    return false
  })?.hash
  if (!hash)
    throw new Error(`Invalid repository reference: ${repoInfo.ref}`)
  return hash
}

async function fetchRepoTarball(tarballUrl: string, tarballFile: string) {
  const proxy = env.HTTPS_PROXY || env.HTTP_PROXY
  await fetchFile(tarballUrl, tarballFile, { proxy })
}

async function getRepoTarball(repoInfo: RepoInfo, cacheDir: string) {
  const repoRefs = await fetchRepoRefs(repoInfo.url)
  const hash = getRepoHash(repoInfo, repoRefs)

  const tarballUrl = `${repoInfo.url}/archive/${hash}.tar.gz`
  const tarballFilePath = join(cacheDir, 'github', repoInfo.author, repoInfo.repoName, `${hash}.tar.gz`)
  // if tarball isn't exist, download it
  try {
    accessSync(tarballFilePath)
  }
  catch (error) {
    mkdirSync(dirname(tarballFilePath), { recursive: true })
    await fetchRepoTarball(tarballUrl, tarballFilePath)
  }
  return {
    tarballFilePath,
    tarballSubdir: repoInfo.subdir ? `${repoInfo.repoName}-${hash}${repoInfo.subdir}` : undefined,
  }
}

function unpackRepoTarball(tarballFilePath: string, destinationDir: string, tarballSubdir?: string) {
  mkdirSync(destinationDir, { recursive: true })
  return tar.extract({
    file: tarballFilePath,
    cwd: destinationDir,
    strip: tarballSubdir ? tarballSubdir.split('/').length : 1,
  }, tarballSubdir ? [tarballSubdir] : [])
}

export async function handlerGitHub(templateName: string, destinationDir: string, options: Options = defaultOptions) {
  printSuccess(`Creating project from GitHub template: ${templateName}`)

  const repoInfo = parseRepoInfo(templateName)
  // if destination is not provided, use the subdir or repo name
  destinationDir = destinationDir || (repoInfo.subdir ? basename(repoInfo.subdir) : repoInfo.repoName)

  if (!isDirEmpty(destinationDir) && !options.force)
    throw new Error('Destination directory is not empty, use --force to override')

  const { tarballFilePath, tarballSubdir } = await getRepoTarball(repoInfo, CACHE_DIR)
  await unpackRepoTarball(tarballFilePath, destinationDir, tarballSubdir)
  // save history
  updateHistoryItem({
    type: 'github',
    templateName,
    timestamp: Date.now(),
  })
}
