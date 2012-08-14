/*global module:false*/
module.exports = function(grunt) {

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
        eqnull: true
      },
      globals: {
        enyo: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint');

};
