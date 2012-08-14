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
exports.description = 'Scaffold an EnyoJS module project';

// Template-specific notes to be displayed before question prompts.
exports.notes = '';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {

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
      name: 'enyo_libraries',
      message: 'Enyo libraries',
      default: '',
      warning: 'Space separated list of enyo libraries dependencies'
    }
  ], function(err, props) {
    // Make an array out of the enyo_libraries string
    var words = grunt.utils._.words;
    var clean = grunt.utils._.clean;
    props.enyo_libraries = words(clean(props.enyo_libraries));
    if(!props.enyo_libraries[0]){
      props.enyo_libraries = [];
    }

    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    init.addLicenseFiles(files, props.licenses);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props, {noProcess: []});

    // Generate package.json file, used by npm and grunt.
    init.writePackageJSON('package.json', {
      name: props.name,
      version: props.version,
      npm_test: 'grunt',
      node_version: '>= 0.6.0',
      enyo_libraries: props.enyo_libraries
    }, function(pkg, props){
      pkg.enyo_template = 'module';
      pkg.enyo_libraries = props.enyo_libraries;
      return pkg;
    });

    // All done!
    done();
  });

};