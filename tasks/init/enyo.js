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
exports.description = 'Adds Enyo core to your project';

// Template-specific notes to be displayed before question prompts.
exports.notes = '';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = 'enyo';

// The actual init template.
exports.template = function(grunt, init, done) {

  grunt.helper('prompt', {type: 'enyo'}, [
    // Prompt for these values.

  ], function(err, props) {
    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props, {noProcess: ['enyo/']});

    // Make the shellscripts executable
    fs.chmodSync(init.destpath('enyo/tools/minify.sh'), '755');
    fs.chmodSync(init.destpath('enyo/minify/minify.sh'), '755');

    // All done!
    done();
  });

};