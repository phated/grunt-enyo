module.exports = function(grunt) {

  var path = require('path');

  grunt.registerTask('build', 'Build your Enyo project - The Awesome Way', function(){
    process.argv.pop();
    // Build process needs to know the absolute path to enyo
    process.argv.push('-enyo');
    process.argv.push(process.cwd() + '/enyo');

    // Options for building enyo
    process.argv.push(process.cwd() + '/enyo/minify/package.js');
    process.argv.push('-no-alias');
    process.argv.push('-output');
    process.argv.push('../../build/enyo');

    // Change the CWD
    process.chdir('enyo/minify');

    // Require in the minifier to process argv and build
    require(process.cwd() + '/../tools/minifier/minify.js');

    // Hack to get minifier to run again later, need to do a module.exports on the minifer to fix this
    delete require.cache[path.normalize(process.cwd() + '/../tools/minifier/minify.js')];

    // Remove the the arguments not related to the enyo absolute path
    process.argv.splice(4);

    // Options for building app
    process.argv.push('package.js');
    process.argv.push('-output');
    process.argv.push('../build/app');

    // Change the CWD again
    process.chdir('../../tools');

    // Require in the minifier (not cached because we deleted it)
    require(process.cwd() + '/../enyo/tools/minifier/minify');
  });

};