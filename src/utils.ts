import https from 'node:https'
import { accessSync, copyFile, createWriteStream, mkdirSync, readdir, stat } from 'node:fs'
import { join } from 'node:path'
import { HttpsProxyAgent } from 'https-proxy-agent'

export function fetchFile(url: string, path: string, options: { proxy?: string } = {}) {
  const agent = options.proxy ? new HttpsProxyAgent(options.proxy) : undefined
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      const code = res.statusCode!
      if (code >= 400) {
        reject(new Error(`Failed to fetch file: ${code}`))
      }
      else if (code >= 300) {
        fetchFile(res.headers.location!, path, options)
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

export function copyFolderFiles(sourceDir: string, destinationDir: string, exclude: string[] = []) {
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
          if (exclude.includes(file))
            return resolveFile(true)

          const sourceFilePath = join(sourceDir, file)
          const destinationFilePath = join(destinationDir, file)

          stat(sourceFilePath, (err, stats) => {
            if (err)
              rejectFile(err)

            if (stats.isDirectory()) {
              copyFolderFiles(sourceFilePath, destinationFilePath)
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
