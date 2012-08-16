module.exports = function(grunt) {

  var path = require('path');

  grunt.registerInitTask('add', 'Manager your EnyoJS packages', function(){
    var packages = grunt.utils.toArray(arguments);

    var pathPrefix = 'add/modules/';

    var add = {
      // Search init template paths for filename.
      srcpath: function(arg1) {
        if (arg1 == null) { return null; }
        var args = ['add', 'modules'].concat(grunt.utils.toArray(arguments));
        return grunt.task.getFile.apply(grunt.file, args);
      },
      // Determine absolute destination file path.
      destpath: path.join.bind(path, process.cwd()),
      // Return an object containing files to copy with their absolute source path
      // and relative destination path, renamed (or omitted) according to rules in
      // rename.json (if it exists).
      filesToCopy: function(packageName, props) {
        var files = {};
        // Iterate over all source files.
        grunt.task.expandFiles({dot: true}, pathPrefix + packageName + '/**').forEach(function(obj) {
          // Get the path relative to the template root.
          var relpath = 'lib/' + obj.rel.slice(pathPrefix.length);
          // var rule = init.renames[relpath];
          // Omit files that have an empty / false rule value.
          // if (!rule && relpath in init.renames) { return; }
          // Create a property for this file.
          // files[rule ? grunt.template.process(rule, props, 'init') : relpath] = obj.rel;
          files[relpath] = obj.rel;
        });
        return files;
      },
      // Given an absolute or relative source path, and an optional relative
      // destination path, copy a file, optionally processing it through the
      // passed callback.
      copy: function(srcpath, destpath, options) {
        // Destpath is optional.
        if (typeof destpath !== 'string') {
          options = destpath;
          destpath = srcpath;
        }
        // Ensure srcpath is absolute.
        if (!grunt.file.isPathAbsolute(srcpath)) {
          srcpath = add.srcpath(srcpath);
        }
        // Use placeholder file if no src exists.
        if (!srcpath) {
          srcpath = grunt.task.getFile('init/misc/placeholder');
        }
        grunt.verbose.or.write('Writing ' + destpath + '...');
        try {
          grunt.file.copy(srcpath, add.destpath(destpath), options);
          grunt.verbose.or.ok();
        } catch(e) {
          grunt.verbose.or.error().error(e);
          throw e;
        }
      }
    };

    packages.forEach(function(packageName){
      var files = add.filesToCopy(packageName, {});

      Object.keys(files).forEach(function(destpath) {
        var o = {};
        var srcpath = files[destpath];
        // If srcpath is relative, match it against options.noProcess if
        // necessary, then make srcpath absolute.
        var relpath;
        if (srcpath && !grunt.file.isPathAbsolute(srcpath)) {
          srcpath = grunt.task.getFile(srcpath);
        }
        // Copy!
        add.copy(srcpath, destpath, o);
      });
    });

  });

};