# ncreate

[![npm version][npm-version-badge]][npm-version-href]
[![minzip][minzip-badge]][minizip-href]
[![jsdocs][jsdocs-badge]][jsdocs-href]
[![license][license-badge]][license-href]

`npm create` or `git clone && rimraf .git` => `ncreate`

Create your new project from a NPM, GitHub or local template with a single command.

## Installation

```bash
npm install -g ncreate
```

## Usage

### NPM template

```bash
ncreate vue@latest my-vue-app

# npm create vue@latest my-vue-app
```

The agent of `ncreate` is configurable, you can use `npm`, `yarn`, `pnpm` or `bun` as the agent.

### GitHub template

```bash
ncreate Lu-Jiejie/ts-starter my-ts-app

# git clone https://github.com/Lu-Jiejie/ts-starter my-ts-app
# cd my-ts-app
# rimraf .git
```

The way to create a project from a GitHub template refers to [degit](https://github.com/Rich-Harris/degit).

It means that you can `ncreate` a GitHub template with a spcific branch, tag or commit hash. Like:

```
ncreate Lu-Jiejie/ts-starter#main my-vitesse-app

ncreate Lu-Jiejie/ts-starter#9d73fe3 my-vitesse-app
```

All the GitHub templates will be cached in `~/.ncreate/github` by default, for the sake of speed.

### Local template

```bash
ncreate ts-starter my-ts-app
```

The local templates are configured in `~/.ncreate/config.json`. See [Configuration](#Configuration).

### Interactive prompt

```bash
ncreate
```

If you don't provide the template name, `ncreate` will prompt you to choose a template from history or local templates.

All the given choices will be sorted by the last used time.

The history will be saved in `~/.ncreate/history.json`.

## Configuration

You can configure some options in `~/.ncreate/config.json`.

```json
{
  // The default agent of ncreate. Null means choosing the agent by interactive prompt.
  "agent": "pnpm",
  // The local templates.
  "localTemplates": [
    {
      // The name of the template.
      "name": "ts-starter",
      // The local path to the local template.
      "path": "PATH_TO_YOUR_LOCAL_TEMPLATE"
    }
  ]
}
```

## Inspiration

`bun create` from [bun](https://bun.sh/docs/cli/bun-create)

~~But `bun create` is terrible on Windows.~~

<!-- Badge -->
[npm-version-badge]: https://img.shields.io/npm/v/ncreate?style=flat&color=ddd&labelColor=444
[npm-version-href]: https://www.npmjs.com/package/ncreate
[minzip-badge]: https://img.shields.io/bundlephobia/minzip/ncreate?style=flat&color=ddd&labelColor=444&label=minizip
[minizip-href]: https://bundlephobia.com/result?p=ncreate
[jsdocs-badge]: https://img.shields.io/badge/jsDocs-reference-ddd?style=flat&color=ddd&labelColor=444
[jsdocs-href]: https://www.jsdocs.io/package/ncreate
[license-badge]: https://img.shields.io/github/license/Lu-Jiejie/ncreate?style=flat&color=ddd&labelColor=444
[license-href]: https://github.com/Lu-Jiejie/ncreate/blob/main/LICENSE
