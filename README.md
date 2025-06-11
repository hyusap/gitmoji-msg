gitmoji-msg
=================

create gitmoji commit messages with ai!


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/gitmoji-msg.svg)](https://npmjs.org/package/gitmoji-msg)
[![Downloads/week](https://img.shields.io/npm/dw/gitmoji-msg.svg)](https://npmjs.org/package/gitmoji-msg)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g gitmoji-msg
$ gitmoji-msg COMMAND
running command...
$ gitmoji-msg (--version)
gitmoji-msg/0.0.0 darwin-arm64 node-v23.3.0
$ gitmoji-msg --help [COMMAND]
USAGE
  $ gitmoji-msg COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`gitmoji-msg hello PERSON`](#gitmoji-msg-hello-person)
* [`gitmoji-msg hello world`](#gitmoji-msg-hello-world)
* [`gitmoji-msg help [COMMAND]`](#gitmoji-msg-help-command)
* [`gitmoji-msg plugins`](#gitmoji-msg-plugins)
* [`gitmoji-msg plugins add PLUGIN`](#gitmoji-msg-plugins-add-plugin)
* [`gitmoji-msg plugins:inspect PLUGIN...`](#gitmoji-msg-pluginsinspect-plugin)
* [`gitmoji-msg plugins install PLUGIN`](#gitmoji-msg-plugins-install-plugin)
* [`gitmoji-msg plugins link PATH`](#gitmoji-msg-plugins-link-path)
* [`gitmoji-msg plugins remove [PLUGIN]`](#gitmoji-msg-plugins-remove-plugin)
* [`gitmoji-msg plugins reset`](#gitmoji-msg-plugins-reset)
* [`gitmoji-msg plugins uninstall [PLUGIN]`](#gitmoji-msg-plugins-uninstall-plugin)
* [`gitmoji-msg plugins unlink [PLUGIN]`](#gitmoji-msg-plugins-unlink-plugin)
* [`gitmoji-msg plugins update`](#gitmoji-msg-plugins-update)

## `gitmoji-msg hello PERSON`

Say hello

```
USAGE
  $ gitmoji-msg hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ gitmoji-msg hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/hyusap/gitmoji-msg/blob/v0.0.0/src/commands/hello/index.ts)_

## `gitmoji-msg hello world`

Say hello world

```
USAGE
  $ gitmoji-msg hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ gitmoji-msg hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/hyusap/gitmoji-msg/blob/v0.0.0/src/commands/hello/world.ts)_

## `gitmoji-msg help [COMMAND]`

Display help for gitmoji-msg.

```
USAGE
  $ gitmoji-msg help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for gitmoji-msg.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.28/src/commands/help.ts)_

## `gitmoji-msg plugins`

List installed plugins.

```
USAGE
  $ gitmoji-msg plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ gitmoji-msg plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/index.ts)_

## `gitmoji-msg plugins add PLUGIN`

Installs a plugin into gitmoji-msg.

```
USAGE
  $ gitmoji-msg plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into gitmoji-msg.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the GITMOJI_MSG_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GITMOJI_MSG_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ gitmoji-msg plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ gitmoji-msg plugins add myplugin

  Install a plugin from a github url.

    $ gitmoji-msg plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ gitmoji-msg plugins add someuser/someplugin
```

## `gitmoji-msg plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ gitmoji-msg plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ gitmoji-msg plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/inspect.ts)_

## `gitmoji-msg plugins install PLUGIN`

Installs a plugin into gitmoji-msg.

```
USAGE
  $ gitmoji-msg plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into gitmoji-msg.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the GITMOJI_MSG_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GITMOJI_MSG_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ gitmoji-msg plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ gitmoji-msg plugins install myplugin

  Install a plugin from a github url.

    $ gitmoji-msg plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ gitmoji-msg plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/install.ts)_

## `gitmoji-msg plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ gitmoji-msg plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ gitmoji-msg plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/link.ts)_

## `gitmoji-msg plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ gitmoji-msg plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ gitmoji-msg plugins unlink
  $ gitmoji-msg plugins remove

EXAMPLES
  $ gitmoji-msg plugins remove myplugin
```

## `gitmoji-msg plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ gitmoji-msg plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/reset.ts)_

## `gitmoji-msg plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ gitmoji-msg plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ gitmoji-msg plugins unlink
  $ gitmoji-msg plugins remove

EXAMPLES
  $ gitmoji-msg plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/uninstall.ts)_

## `gitmoji-msg plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ gitmoji-msg plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ gitmoji-msg plugins unlink
  $ gitmoji-msg plugins remove

EXAMPLES
  $ gitmoji-msg plugins unlink myplugin
```

## `gitmoji-msg plugins update`

Update installed plugins.

```
USAGE
  $ gitmoji-msg plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.40/src/commands/plugins/update.ts)_
<!-- commandsstop -->
