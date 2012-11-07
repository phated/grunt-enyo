# grunt-enyo

CLI for EnyoJS

## Getting Started
Install this package globally with: `npm install -g enyo`

## Usage

### Init task

Scaffolds an Enyo project in your current working directory

(Available: enyo, bootplate, module)

In terminal: (navigate to empty directory)
`enyo init:bootplate`

### Add task

Installs the specified package (or packages) to a directory named lib in your current working directory

(Available: layout, onyx, fu, canvas, extra)

In terminal: (navigate to empty directory)
`enyo add:layout`

You can also chain packages
`enyo add:layout:onyx`

### Remove task

Uninstalls the specified package (or packages) to a directory named lib in your current working directory

(Available: layout, onyx, fu, canvas, extra)

In terminal: (navigate to empty directory)
`enyo remove:layout`

You can also chain packages
`enyo remove:layout:onyx`

### Debug task

Starts a static file server in your current working directory

In terminal: (navigate to project initialized by this tool)
`enyo debug`

### Build task

Build your Bootplate project without the need for minify.sh or minify.bat (without entering the tools directory!)

#### ***This is only tested against Bootplate, feel free to test it against other projects, but be careful!!!***

In terminal: (navigate to a Bootplate project initialized by this tool)
`enyo build`

## Documentation
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

0.1.0alpha6 -
  * Switched from Bower fork to actual Bower (thanks to .bowerrc)
  * Added .bowerrc to init templates
  * More Bower tasks implemented (install/add, uninstall/remove, update, search, lookup, list/ls)
  * Update Bootplate template
  * Git Submodule Enyo in init:enyo
  * Add gitignore to init:module
  * Update Grunt to 0.3.17 and make everything pass lint (use strict)
  * Update CLI help to display info about Bower tasks (and remove concat, min, server, watch since we have debug and build)


0.1.0alpha5 -
  * Bower added
  * Remove task
  * Fixed add task

0.1.0alpha4 -
  * Build task
  * No need for minify.sh or minify.bat

0.1.0alpha3 -
  * Add task
  * Local only (add:layout)

0.1.0alpha2 -
  * More init tasks (init:enyo and init:module tasks)

0.1.0alpha1 -
  * Initial Release (init:bootplate and debug tasks)

## Roadmap

* Add tests (before Beta)
* Documentation/examples for Bower tasks
* Move templates out of bootplate in order to git submodule it for easy upgrades
* Submit/standardize a module bootplate and git submodule it as a init template
* Upgrade to Grunt 0.4
* Create dedicated task for debug server instead of an alias for `server watch`

## License
Copyright 2012 Blaine Bublitz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
