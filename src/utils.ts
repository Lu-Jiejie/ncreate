import https from 'node:https'
import { createWriteStream } from 'node:fs'
import { HttpsProxyAgent } from 'https-proxy-agent'

export function remove<T>(arr: T[], value: T) {
  const index = arr.indexOf(value)
  if (index !== -1)
    arr.splice(index, 1)

  return arr
}

export function fetchFile(url: string, path: string, options: { proxy?: string } = {}) {
  console.log(url, path)
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
