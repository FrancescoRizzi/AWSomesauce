'use strict';
/* jshint camelcase:false */
var gulp = require('gulp');

// gulp script configuration:
var conf = require('./gulp.config.json');

// child_process.exec:
var exec = require('child_process').exec;

// gulp-load-plugins below will load all modules whose name
// starts with 'gulp-*' or 'gulp.*', but we have to explicitly
// load those whose name doesn't fit the patterns:
var del = require('del');
var browserSync = require('browser-sync').create();
var wiredep = require('wiredep').stream;

// Load all gulp Plugins listed in package.json
//	dependencies, devDependencies, and peerDependencies
// whose name starts with 'gulp-*' or 'gulp.*'
var plugins = require('gulp-load-plugins')();

// Shorthand for commonly used plugins
var gutil = plugins.util;
var log = plugins.util.log;
var clrs= plugins.util.colors;
var sass = plugins.sass;
var inject = plugins.inject;
var watch = plugins.watch;
var ngAnnotate = plugins.ngAnnotate;
var debug = plugins.debug;
var ngFilesort = plugins.angularFilesort;
var chmod = plugins.chmod;
var plumber = plugins.plumber;

// Common color/styles:
var WG = clrs.white.bgGreen;
var KR = clrs.black.bgRed;

/*	TASK: clear
	Clears the dest area via del
	************************************************** */
gulp.task('clear', function() {
	log(WG('TASK: clear >>'));
	var todel = [conf.paths.dest+'/**'];
	log('Deleting: '+todel.toString());
	return del(todel);
});

/*	TASK: copy
	Copies src to dest
	************************************************** */
gulp.task('copy', ['clear'], function() {
	log(WG('TASK: copy >>'));

	var base = conf.paths.src;
	var src = conf.paths.src+'/**/*';
	var dest= conf.paths.dest;
	log('From: '+src);
	log('To  : '+dest);
	log('Base: '+base);

	return gulp
		.src(src, { base: base })
		.pipe(chmod(0o755))
		.pipe(gulp.dest(dest));
});

/*	TASK: compile-sass
	Compiles SASS into CSS via sass
	************************************************** */
gulp.task('compile-sass', ['copy'], function() {
	log(WG('TASK: compile-sass >>'));

	var src = conf.paths.dest+'/sass/*.scss';
	var dest= conf.paths.dest+'/static/styles/';
	log("From: "+src);
	log("To  : "+dest);

	return gulp
		.src(src)
		//.pipe(plumber())
		//.pipe(sass.sync().on('error', sass.logError))
		.pipe(sass())	//.on('error', sass.logError))
		.pipe(gulp.dest(dest));
});

/*	TASK: inject-css
	Inject CSS links in index.html, via inject
	Between <!-- inject:css --> and <!-- endinject -->
	************************************************** */
gulp.task('inject-css', ['compile-sass'], function() {
//gulp.task('inject-css', ['copy'], function() {
	log(WG('TASK: inject-css >>'));

	var workfile = conf.paths.dest+'/index.html';
	var src = conf.paths.dest+'/static/styles/*.css';
	var dest = conf.paths.dest;
	log("Workfile   : "+workfile);
	log("Sources    : "+src);
	log("Destination: "+dest);

	//Grab sources without reading each file:
	var sources = gulp.src([src], {read: false});

	return gulp
		.src(workfile)
		//inject with paths relative to destination
		.pipe(inject(sources, { relative: true }))
		.pipe(gulp.dest(dest));
});

/*	TASK: move-apig
	Moves the JS libraries necessary for apigClient
	************************************************** */
gulp.task('move-apig', ['inject-css'], function() {
	log(WG('TASK: move-apig >>'));

	var src  = conf.paths.dest+'/js/apiGateway-js-sdk/**/*.*';
	var dest = conf.paths.dest+'/static/scripts';

	log("From    : "+src);
	log("To      : "+dest);

	return gulp
		.src(src)
		.pipe(gulp.dest(dest));
});

/*	TASK: clear-apig
	Removes the JS libraries for apigClient after they've
	been copied by move-apig.
	************************************************** */
gulp.task('clear-apig', ['move-apig'], function() {
	log(WG('TASK: clear-apig >>'));

	var todel=[conf.paths.dest+'/js/apiGateway-js-sdk/**'];
	log("Clearing: "+todel.toString());

	return del(todel);
});

/*	TASK: inject-js
	Inject JS links in index.html, via inject and gulp-angular-filesort
	Between <!-- inject:js --> and <!-- endinject -->
	************************************************** */
gulp.task('inject-js', ['clear-apig'], function() {
	log(WG('TASK: inject-js >>'));

	var workfile = conf.paths.dest+'/index.html';
	var src = conf.paths.dest+'/app/**/*.js';
	var dest = conf.paths.dest;
	log("Workfile   : "+workfile);
	log("Sources    : "+src);
	log("Destination: "+dest);

	//Grab sources: must read to enable angular filesort
	var sources = gulp.src([src])
		.pipe(ngFilesort());

	return gulp
		.src(workfile)
		//inject with paths relative to destination
		.pipe(inject(sources, { relative: true }))
		.pipe(gulp.dest(dest));
});

/*	TASK: inject-bower
	Inject Bower dependencies in index.html, via wiredep
	Between
		<!-- bower:css --> and <!-- endbower -->
		<!-- bower:js --> and <!-- endbower -->
	NOTE: see below for path tweaks performed during injection
	************************************************** */
gulp.task('inject-bower', ['inject-js'], function() {
	log(WG('TASK: inject-bower >>'));

	var workfile = conf.paths.dest+'/index.html';
	var dest = conf.paths.dest;

	var wiredepOpts = {
		directory: 'bower_components',
		// onPathInjected: function(fileObject) {
		// },
		fileTypes: {
			html: {
				replace: {
					js: function(filePath) {
						// Path tweaking:
						// if the given filePath starts with '../<bowerDir>/' (case-sensitive)
						// we replace that prefix with 'static/scripts/'
						var modifiedPath = filePath.replace(/^(\.\.\/bower_components)/,"static/scripts");

						log("Injecting bower JS: "+filePath);
						if (modifiedPath!=filePath) {
							log("\tas "+modifiedPath);

							// Copy file

							// Copy source is the filePath without the leading '..'
							var cpSource = filePath.replace(/^(\.\.\/)/,"\.\/");

							// Copy destination:
							var cpDestScripts = "./"+conf.paths.dest+"/static/scripts";
							var cpDest = cpSource.replace(/^(\.\/bower_components)/, cpDestScripts);
							var lastSlash = cpDest.lastIndexOf("/");
							var cpDestParent = cpDest.substr(0, lastSlash);

							// mkdir ensures the destination directory exists to prevent cp from failing
							// mkdir -p prevents failures if the directory already exists,
							// and should create any intermediate parent as needed.

							var cmd = 'mkdir -p "'+cpDestParent+'" && cp -f "'+cpSource+'" "'+cpDestParent+'"';
							log("\tcopying...");
							log("\t"+cmd);

							exec(cmd, function(err, stdout, stderr) {
								log("[FILE COPY] finished.");
								if (stdout) {
									log("[FILE COPY] STDOUT:");
									log(stdout);
								}
								if (stderr) {
									log("[FILE COPY] STDERR:");
									log(stderr);
								}
								if (err) {
									throw new gutil.PluginError({
										plugin: 'inject-bower-js-filecopy',
										message: err
									});
								}
							});
							// End of copy file

						}
						return '<script src="'+modifiedPath+'"></script>';
					},
					css: function(filePath) {
						// Path tweaking:
						// if the given filePath starts with '../<bowerDir>/' (case-sensitive)
						// we replace that prefix with 'static/scripts/'
						var modifiedPath = filePath.replace(/^(\.\.\/bower_components)/,"static/styles");

						log("Injecting bower CSS: "+filePath);
						if (modifiedPath!=filePath) {
							log("\tas "+modifiedPath);

							// Copy file

							// Copy source is the filePath without the leading '..'
							var cpSource = filePath.replace(/^(\.\.\/)/,"\.\/");

							// Copy destination:
							var cpDestScripts = "./"+conf.paths.dest+"/static/styles";
							var cpDest = cpSource.replace(/^(\.\/bower_components)/, cpDestScripts);
							var lastSlash = cpDest.lastIndexOf("/");
							var cpDestParent = cpDest.substr(0, lastSlash);

							// mkdir ensures the destination directory exists to prevent cp from failing
							// mkdir -p prevents failures if the directory already exists,
							// and should create any intermediate parent as needed.

							var cmd = 'mkdir -p "'+cpDestParent+'" && cp -f "'+cpSource+'" "'+cpDestParent+'"';
							log("\tcopying...");
							log("\t"+cmd);

							exec(cmd, function(err, stdout, stderr) {
								log("[FILE COPY] finished.");
								if (stdout) {
									log("[FILE COPY] STDOUT:");
									log(stdout);
								}
								if (stderr) {
									log("[FILE COPY] STDERR:");
									log(stderr);
								}
								if (err) {
									throw new gutil.PluginError({
										plugin: 'inject-bower-css-filecopy',
										message: err
									});
								}
							});
							// End of copy file

						}
						return '<link rel="stylesheet" href="'+modifiedPath+'" />';
					}

				}
			}
		}
	};
	log("Workfile   : "+workfile);
	log("Bower Dir  : "+wiredepOpts['directory']);
	log("Destination: "+dest);

	return gulp
		.src(workfile)
		.pipe(wiredep(wiredepOpts))
		.pipe(gulp.dest(dest));
});

/*	TASK: annotate
	Injects Angular Dependencies via ngAnnotate
	************************************************** */
gulp.task('annotate', ['inject-bower'], function() {
	log(WG('TASK: annotate >>'));

	var root = conf.paths.dest+'/app';
	var src = root+'/**/*.js';
	var dest = root;
	var annotateOpts = {
		add: true,
		stats: true
	}
	log("Base Root  : "+root);
	log("Sources    : "+src);
	log("Destination: "+dest);

	return gulp
		.src(src, {base: root})
		.pipe(ngAnnotate(annotateOpts))
		.pipe(gulp.dest(dest));
});

/*	TASK: build
	Builds from src to dest
	************************************************** */
gulp.task('build', ['annotate'], function() {
	log(WG('TASK: build >>'));

	var sassDir = conf.paths.dest+'/sass';
	log("Clearing: "+sassDir);
	return del([sassDir]);
});

/*	TASK: build-done
	Synchronization task: can be used as dependency
	to trigger post-build events. Triggers browserSync.reload.
	************************************************** */
gulp.task('build-done', ['build'], browserSync.reload);

/*	TASK: serve
	Build and Serve locally
	************************************************** */
gulp.task('serve', ['build'], function() {
	log(WG('TASK: serve >>'));

	//Serve via browserSync:
	//==================================================
	var serveDir = conf.paths.dest;
	var serveFiles = serveDir+'/**/*.*';
	// var serveRoutes = {
	// 	'/bower_components': 'bower_components'
	// }
	var servePort = conf.serve.port;

	log("Serve Directory: "+serveDir);
	log("Serve Files    : "+serveFiles);
	log("Serve Port     : "+servePort);
	// log("Serve Routes   : ");
	// Object.getOwnPropertyNames(serveRoutes).forEach(function(val, idx, array) {
	// 	log('\t'+val+' -> '+serveRoutes[val]);
	// });

	browserSync.init({
		files: [serveFiles],
		server: {
			baseDir: serveDir
			// routes: serveRoutes
		},
		port: servePort,
		logConnections: true,
		logLevel: 'info',
		logPrefix: 'SWA',
		notify: false,
		reloadDelay: 1000,
		reloadDebounce: 2000
	});

	//Watch
	//==================================================
	var towatch = [
		conf.paths.src+'/**/*',
		'package.json',
		'bower.json'
	];
	log("Watching       : "+towatch.toString());
	gulp.watch(towatch, ['build-done']);
});

/*	TASK: default
	Default task
	************************************************** */
gulp.task('default', function() {
	log(WG('TASK: default >>'));
	log('TODO');