exports.init = function(grunt){
  'use strict';

  var exports = {};

  exports.install = function(){
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
  };

  exports.uninstall = function(){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var uninstall = require('bower').commands.uninstall;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    uninstall(this.args, {})
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
  };

  exports.update = function(){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var update = require('bower').commands.update;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    update(this.args, {})
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
  };

  exports.search = function(query){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var search = require('bower').commands.search;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    search(query)
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
  };

  exports.lookup = function(query){
    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var lookup = require('bower').commands.lookup;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    lookup(query)
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
  };

  exports.list = function(){
    // TODO: accept options parameters and pass into list

    // We have to require in bower inside of the task so it's config will read .bowerrc during an init process
    var list = require('bower').commands.list;
    var template = require('bower/lib/util/template');

    // Flag grunt to know we are async
    var done = this.async();

    var fakeOptions = {
      argv: []
    };

    list(fakeOptions)
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
  };

  return exports;
};
