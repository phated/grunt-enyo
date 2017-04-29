module.exports = grunt => {
  'use strict';

  var bowerTasks = require('./helpers/bower').init(grunt);

  grunt.registerInitTask('install', 'Install EnyoJS modules to your project', bowerTasks.install);

  grunt.registerInitTask('add', 'Alias for the install task', bowerTasks.install);

  grunt.registerInitTask('uninstall', 'Uninstalls EnyoJS modules from your project', bowerTasks.uninstall);

  grunt.registerInitTask('remove', 'Alias for the uninstall task', bowerTasks.uninstall);

  grunt.registerInitTask('update', 'Update EnyoJS modules in your project', bowerTasks.update);

  grunt.registerInitTask('search', 'Search the module repository', bowerTasks.search);

  grunt.registerInitTask('lookup', 'Lookup a module', bowerTasks.lookup);

  grunt.registerInitTask('list', 'List modules in project', bowerTasks.list);

  grunt.registerInitTask('ls', 'Alias for the list task', bowerTasks.list);

};
