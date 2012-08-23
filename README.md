[![build status](https://secure.travis-ci.org/phated/grunt-enyo.png)](http://travis-ci.org/phated/grunt-enyo)
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

### Debug task

Starts a static file server in your current working directory

In terminal: (navigate to project initialized by this tool)
`enyo debug`

## Documentation
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

0.1.0alpha3 - Add task - local only (add:layout)

0.1.0alpha2 - More init tasks (init:enyo and init:module tasks)

0.1.0alpha1 - Initial Release (init:bootplate and debug tasks)

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
