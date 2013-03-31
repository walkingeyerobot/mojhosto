module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        'Gruntfile.js',
        'lib/**/*.js',
        '!lib/gen/*',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      }
    },

    nodeunit: {
      tests: ['test/**/*_test.js']
    },

    watch: {
      options: {
        debounceDelay: 100
      },

      js: {
        files: ['lib/**/*.js'],
        tasks: ['jshint', 'browserify2']
      },

      stylus: {
        files: 'stylus/**/*.styl',
        tasks: 'stylus:dev'
      },

      templates: {
        files: 'lib/**/*.html',
        tasks: 'template-module:dev'
      }
    },

    clean: {
      tmp: ['tmp', 'gen', 'lib/gen', 'srv-dev/gen']
    },

    uglify: {
      compile: {
        files: {
          'srv-dev/gen/bundle.min.js': ['srv-dev/gen/bundle.js']
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 8080,
          base: 'srv-dev',
          hostname: null
        }
      }
    },

    browserify2: {
      dev: {
        entry: 'lib/main.js',
        compile: 'srv-dev/gen/bundle.js',
        debug: false
      }
    },

    'template-module': {
      dev: {
        options: {
          module: true,
          provider: 'underscore'
        },
        files: {
          'lib/gen/templates.js': ['lib/**/*.html']
        }
      }
    },

    stylus: {
      dev: {
        options: {
          paths: ['stylus/include'],
          compress: true
        },
        files: {
          'srv-dev/gen/bundle.css': ['stylus/rules/**/*.styl']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.loadNpmTasks('grunt-browserify2');
  grunt.loadNpmTasks('grunt-template-module');

  grunt.registerTask('default', ['jshint nodeunit']);

  grunt.registerTask('build-dev', ['stylus:dev', 'template-module:dev', 'browserify2:dev'])
  grunt.registerTask('dev', ['connect:server', 'build-dev', 'watch']);

};