(function () {
	'use strict';

	var paths = {
		js: ['*.js', 'src/*.js', 'test/*.js']
	};

	module.exports = function (grunt) {
		require ('load-grunt-tasks') (grunt);

		grunt.registerTask ('default', ['jshint', 'mochaTest']);
		grunt.registerTask ('test', ['env:test', 'jshint', 'mochaTest']);
		grunt.registerTask ('check', ['env:test', 'jshint']);

		grunt.initConfig ({
			pkg: grunt.file.readJSON ('package.json'),
			concat: {
				options: {
					separator: ';'
				},
				dist: {
					src: ['src/subwave.js'],
					dest: 'uh.js'
				},
			},
			connect: {
				server: {
					options: {
						hostname: 'localhost',
						port: 8000,
						base: 'public',
						keepalive: true
					}
				}
			},
			env: {
				test: {
					NODE_ENV: 'test'
				}
			},
			jshint: {
				all: {
					src: paths.js,
					options: {
						jshintrc: true
					}
				}
			},
			mochaTest: {
				test: {
					options: {
						reporter: 'spec',
					},
					src: ['test/*.js']
				}
			},
			watch: {
				js: {
					files: paths.js,
					tasks: ['jshint'],
					options: {
						livereload: true
					}
				}
			}
		});
	};
} ()); 
