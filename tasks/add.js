module.exports = function(grunt) {
  'use strict';

  grunt.registerInitTask('add', 'Add EnyoJS modules to your project', function(){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var install = require('bower').commands.install;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    install(this.args, {})
      .on('data', function (data){
        if(data){
          grunt.log.writeln(data);
        }
      })
      .on('error', function (err){
        template('error', {
          message: err.message
        })
        .on('data', function (d){
          grunt.log.error(d);
        })
        .on('end', function (){
          done(false);
        });
      })
      .on('end', function (data){
        if(data){
          grunt.log.writeln(data);
        }
        grunt.log.ok();
        // Tell grunt we are done
        done();
      });
  });

};
