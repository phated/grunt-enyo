/*
 * enyo init:bootplate
 * https://github.com/phated/grunt-enyo
 *
 * Copyright 2012 Blaine Bublitz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * http://github.com/phated/grunt-enyo/blob/master/LICENSE-Apache
 */

var fs = require('fs');

// Basic template description.
exports.description = 'Scaffold an EnyoJS Bootplate project';

// Template-specific notes to be displayed before question prompts.
exports.notes = '';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = (grunt, init, done) => {
  'use strict';

  grunt.helper('prompt', {type: 'enyo'}, [
    // Prompt for these values.
    grunt.helper('prompt_for', 'name'),
    grunt.helper('prompt_for', 'description', 'The best EnyoJS project ever.'),
    grunt.helper('prompt_for', 'version'),
    grunt.helper('prompt_for', 'repository'),
    grunt.helper('prompt_for', 'homepage'),
    grunt.helper('prompt_for', 'bugs'),
    grunt.helper('prompt_for', 'licenses', 'Apache'),
    grunt.helper('prompt_for', 'author_name'),
    grunt.helper('prompt_for', 'author_email'),
    grunt.helper('prompt_for', 'author_url'),
    {
      name: 'enyo_dependencies',
      message: 'Enyo libraries',
      default: 'layout onyx',
      warning: 'Space separated list of enyo libraries dependencies'
    }
  ], (err, props) => {
    // Scrub name of hyphens and underscores
    // A little heavy handed but don't want dashes at beginning because that is difficult to deal with in templates
    props.name = grunt.utils._.camelize(props.name);

    // Make an array out of the enyo_dependencies string
    var words = grunt.utils._.words;
    var clean = grunt.utils._.clean;
    var compact = grunt.utils._.compact;
    props.enyo_dependencies = compact(words(clean(props.enyo_dependencies))) || [];
    var component_deps = {};
    props.enyo_dependencies.forEach(dependency => {
      component_deps[dependency] = "*";
    });

    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    init.addLicenseFiles(files, props.licenses);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props, {
      noProcess: ['*.png', 'assets/*', 'api/', 'assets/', 'enyo/', 'tools/']
    });

    // Make the shellscripts executable
    fs.chmodSync(init.destpath('tools/minify.sh'), '755');
    fs.chmodSync(init.destpath('enyo/tools/minify.sh'), '755');
    fs.chmodSync(init.destpath('enyo/minify/minify.sh'), '755');

    // Generate package.json file, used by npm and grunt.
    init.writePackageJSON('package.json', {
      name: props.name,
      version: props.version,
      npm_test: 'grunt',
      node_version: '>= 0.6.0'
    });

    init.writePackageJSON('component.json', {
      name: props.name,
      version: props.version,
      dependencies: component_deps
    });

    // Install the packages specified in component.json
    grunt.task.run('install');

    // All done!
    done();
  });

};
