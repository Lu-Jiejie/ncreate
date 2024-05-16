import https from 'node:https'
import { accessSync, copyFile, createWriteStream, mkdirSync, readdir, readdirSync, stat } from 'node:fs'
import { join } from 'node:path'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { minimatch } from 'minimatch'

export function fetchFile(url: string, path: string, options: { proxy?: string } = {}) {
  const agent = options.proxy ? new HttpsProxyAgent(options.proxy) : undefined
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      const code = res.statusCode!
      if (code >= 400) {
        reject(new Error(`Failed to fetch file: ${code}`))
      }
      else if (code >= 300) {
        fetchFile(res.headers.location!, path, options).then(resolve).catch(reject)
      }
      else {
        const file = createWriteStream(path)
        res.pipe(file)

        file.on('finish', () => {
          resolve(true)
        })
        file.on('error', reject)
      }
    }).on('error', reject)
  })
}

function matchPathByExclude(path: string, exclude: string[]) {
  const positive = exclude.filter(e => !e.startsWith('!'))
  const negative = exclude.filter(e => e.startsWith('!')).map(e => e.slice(1))
  return positive.some(e => minimatch(path, e)) && !negative.some(e => minimatch(path, e))
}

export function copyDir(sourceDir: string, destinationDir: string, exclude: string[] = []) {
  const destinationDirSliceLength = destinationDir.length
  const _formatPath = (path: string) => path.replaceAll(/\\/g, '/').slice(destinationDirSliceLength)
  const _copyDir = (sourceDir: string, destinationDir: string) => {
    return new Promise((resolve, reject) => {
      // if destination isn't exist, create it
      try {
        accessSync(destinationDir)
      }
      catch (error) {
        mkdirSync(destinationDir, { recursive: true })
      }

      readdir(sourceDir, (err, files) => {
        if (err)
          reject(err)

        Promise.all(files.map((file) => {
          return new Promise((resolveFile, rejectFile) => {
            const sourceFilePath = join(sourceDir, file)
            const destinationFilePath = join(destinationDir, file)
            const formatPath = _formatPath(destinationFilePath)
            if (matchPathByExclude(formatPath, exclude)) {
              resolveFile(true)
              return
            }

            stat(sourceFilePath, (err, stats) => {
              if (err)
                rejectFile(err)

              if (stats.isDirectory()) {
                _copyDir(sourceFilePath, destinationFilePath)
                  .then(resolveFile)
                  .catch(rejectFile)
              }
              else {
                copyFile(sourceFilePath, destinationFilePath, (err) => {
                  if (err)
                    rejectFile(err)
                  else
                    resolveFile(true)
                })
              }
            })
          })
        })).then(resolve).catch(reject)
      })
    })
  }

  return _copyDir(sourceDir, destinationDir)
}

export function isDirEmpty(dir: string) {
  try {
    return readdirSync(dir).length === 0
  }
  catch (error) {
    return true
  }
}

export function timeDifference(from: number, to: number = Date.now()) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = to - from

  if (elapsed < msPerDay)
    return '⩽1d'
  else if (elapsed < msPerMonth)
    return `~${Math.round(elapsed / msPerDay)}d`
  else if (elapsed < msPerYear)
    return `~${Math.round(elapsed / msPerMonth)}mo`
  else
    return `~${+(elapsed / msPerYear).toFixed(1)}y`
}
