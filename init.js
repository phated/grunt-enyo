var grunt = require('grunt');
var path = require('path');

// Big dirty hack to get Apache 2.0 into grunt dependency
grunt.file.copy(
  path.normalize(process.cwd() + '/licenses/LICENSE-Apache'),
  path.normalize(path.dirname(require.resolve('grunt'))) + '/../tasks/init/licenses/LICENSE-Apache'
);