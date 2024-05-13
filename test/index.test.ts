import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { execaCommand } from 'execa'
import { minimatch } from 'minimatch'
import { gitignoreToMinimatch } from 'gitignore-to-minimatch'

describe('should work', () => {
  it('parse repo', () => {
    const regexp = /^(?:(?:https:\/\/)?github.com\/)?(?<author>[^\/\s]+)\/(?<name>[^\/\s#]+)(?<path>(?:\/[^\/\s#]+)+)?(?:\/)?(?:#(?<ref>.+))?/
    expect(regexp.exec('github.com/lu-jiejie/ts-starter')?.groups).toMatchInlineSnapshot(`
      {
        "author": "lu-jiejie",
        "name": "ts-starter",
        "path": undefined,
        "ref": undefined,
      }
    `)
    expect(regexp.exec('lu-jiejie/ts-starter/src')?.groups).toMatchInlineSnapshot(`
      {
        "author": "lu-jiejie",
        "name": "ts-starter",
        "path": "/src",
        "ref": undefined,
      }
    `)
    expect(regexp.exec('lu-jiejie/ts-starter/src#abcd1234')?.groups).toMatchInlineSnapshot(`
      {
        "author": "lu-jiejie",
        "name": "ts-starter",
        "path": "/src",
        "ref": "abcd1234",
      }
    `)
  })

  it('fetch refs', async () => {
    interface RepoRef {
      type: string
      name: string
      hash: string
    }
    async function fetchRefs(repoUrl: string): Promise<RepoRef[]> {
      const { stdout } = await execaCommand(`git ls-remote ${repoUrl}`)
      const refs = stdout.split('\n').filter(Boolean).map((line) => {
        const [hash, ref] = line.split('\t')

        if (ref === 'HEAD')
          return { type: 'HEAD', name: 'HEAD', hash }

        const match = ref.match(/refs\/(.+)\/(.+)/)
        if (!match)
          throw new Error(`Invalid ref: ${ref}`)
        return {
          type: match[1] === 'tags' ? 'tag' : match[1] === 'heads' ? 'branch' : match[1],
          name: match[2],
          hash,
        }
      })
      return refs
    }

    expect(await fetchRefs('https://github.com/lu-jiejie/flowmit')).toMatchInlineSnapshot(`
      [
        {
          "hash": "bc95e225df66f6a6c5d406673ab64e0fc2e5e3a0",
          "name": "HEAD",
          "type": "HEAD",
        },
        {
          "hash": "bc95e225df66f6a6c5d406673ab64e0fc2e5e3a0",
          "name": "main",
          "type": "branch",
        },
        {
          "hash": "455b31654ab3cbf31fbceb895e8271d48575a6d3",
          "name": "v0.0.1",
          "type": "tag",
        },
        {
          "hash": "09620c328f825d72f76bbe627757782ef9a2af26",
          "name": "v0.0.1^{}",
          "type": "tag",
        },
        {
          "hash": "21759d904116596add0b6a04371fbd79b9a0f2c2",
          "name": "v0.0.2",
          "type": "tag",
        },
        {
          "hash": "0c000deebe3b30fbbc95cfde32773e140029898d",
          "name": "v0.0.2^{}",
          "type": "tag",
        },
        {
          "hash": "e98e3fc0445ffef334326031cda8c0dc7e1bca93",
          "name": "v0.0.3",
          "type": "tag",
        },
        {
          "hash": "7342e9124c244bf019d5ad51a7bd8dbf0369586f",
          "name": "v0.0.3^{}",
          "type": "tag",
        },
        {
          "hash": "5c53eda3bdddb03c3df0bc47e6dca48876b991cc",
          "name": "v0.0.4",
          "type": "tag",
        },
        {
          "hash": "01acbe2c0cc4dbcb5fa19cad70e05ef533c7c25a",
          "name": "v0.0.4^{}",
          "type": "tag",
        },
        {
          "hash": "e0556b6a61a7797b5d0e4f097b4bed2b278a3f32",
          "name": "v0.0.5",
          "type": "tag",
        },
        {
          "hash": "54c079479aed3e8053b0a91cc588b0b60ce10517",
          "name": "v0.0.5^{}",
          "type": "tag",
        },
        {
          "hash": "8e04cc6c9290179ba675f2d7fdb067658142d60b",
          "name": "v0.0.6",
          "type": "tag",
        },
        {
          "hash": "4e458f310770b611289cba45473d269a9e1afb18",
          "name": "v0.0.6^{}",
          "type": "tag",
        },
        {
          "hash": "a613176ce383071dbd6f04cafbcfd87116146832",
          "name": "v1.0.0",
          "type": "tag",
        },
        {
          "hash": "7c22e245789d40b4b370aa884ae442468690e36b",
          "name": "v1.0.0^{}",
          "type": "tag",
        },
        {
          "hash": "c0dbd2ba7cab24b6b2b388df116bfb685708b06f",
          "name": "v1.0.1",
          "type": "tag",
        },
        {
          "hash": "cc5b1002956bb3b7ca6e3353d09e7e1d704915d8",
          "name": "v1.0.1^{}",
          "type": "tag",
        },
        {
          "hash": "5b64c05bbf2d104ff4695d0bf60ea507e8813707",
          "name": "v1.0.2",
          "type": "tag",
        },
        {
          "hash": "bc95e225df66f6a6c5d406673ab64e0fc2e5e3a0",
          "name": "v1.0.2^{}",
          "type": "tag",
        },
      ]
    `)
  })

  it('match path', () => {
    const match = (path: string, exclude: string[]) => {
      const positive = exclude.filter(e => !e.startsWith('!'))
      const negative = exclude.filter(e => e.startsWith('!')).map(e => e.slice(1))
      return positive.some(e => minimatch(path, e)) && !negative.some(e => minimatch(path, e))
    }
    const gitignore = [
      '*.txt',
      '!hello.txt',
    ]
    const minimatchPatterns = gitignore.map(gitignoreToMinimatch).flat()
    expect(minimatchPatterns).toMatchInlineSnapshot(`
      [
        "/**/*.txt",
        "/**/*.txt/**",
        "!/**/hello.txt",
        "!/**/hello.txt/**",
      ]
    `)

    expect(match('/bar.txt', minimatchPatterns)).toBe(true)
    expect(match('/hello.txt', minimatchPatterns)).toBe(false)
    expect(match('/foo/bar.txt', minimatchPatterns)).toBe(true)
    expect(match('/foo/hello.txt', minimatchPatterns)).toBe(false)
  })
  it.only('load gitignore', async () => {
    let gitignore: string[] = []
    try {
      gitignore = (await readFile('D:\\CODE\\mine\\template\\ts-starter\\.gitignore', 'utf-8')).split('\n').map(l => l.trim()).filter(Boolean)
    }
    catch (error) {
      gitignore = []
    }
    expect(gitignore).toMatchInlineSnapshot(`
      [
        ".cache",
        ".DS_Store",
        ".idea",
        "*.log",
        "*.tgz",
        "coverage",
        "dist",
        "lib-cov",
        "logs",
        "node_modules",
        "temp",
      ]
    `)
  })
})
