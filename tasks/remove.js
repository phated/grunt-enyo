module.exports = function(grunt) {
  'use strict';

  grunt.registerInitTask('remove', 'Remove EnyoJS modules from your project', function(){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var uninstall = require('bower').commands.uninstall;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    uninstall(this.args, {})
      .on('data', function (data){
        if(data){
          grunt.verbose.write(data);
        }
      })
      .on('error', function (err){
        template('error', {
          message: err.message
        })
        .on('data', function (d){
          grunt.verbose.error(d);
        })
        .on('end', function (){
          done(false);
        });
      })
      .on('end', function (data){
        if(data){
          grunt.verbose.write(data);
        }
        grunt.log.ok();
        // Tell grunt we are done
        done();
      });
  });

};
