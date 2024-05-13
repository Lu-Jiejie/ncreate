# ncreate

[![NPM Version](https://img.shields.io/npm/v/ncreate?style=flat&color=ccc)](https://www.npmjs.com/package/ncreate)

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
