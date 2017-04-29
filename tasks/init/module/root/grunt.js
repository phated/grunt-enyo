/*global module:false*/
module.exports = grunt => {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'source/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        enyo: true,
        onyx: true
      }
    }
  });

  // Debug
  grunt.registerTask('debug', 'server watch');

};
