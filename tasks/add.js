var install = require('enyo-bower').commands.install;
var template = require('enyo-bower/lib/util/template');

module.exports = function(grunt) {

  grunt.registerInitTask('add', 'Add EnyoJS modules to your project', function(){
    var packages = grunt.utils.toArray(arguments);

    // Flag grunt to know we are async
    var cb = this.async();

    install(packages)
      .on('data', function (data){
        if(data){
          console.log(data);
        }
      })
      .on('error', function (err){
        template('error', {
          message: err.message
        })
        .on('data', function (d){
          console.log(d);
        })
        .on('end', function (){
          cb();
        });
      })
      .on('end', function (data){
        if(data){
          console.log(data);
        }
        // Tell grunt we are done
        cb();
      });
  });

};
