/*==============================================================================================================================
| IGNIA: BUILD PROCESS
|
| Author        Jeremy Caney, Ignia LLC (Jeremy.Caney@Ignia.com)
| Client        Ignia
| Project       Development Workflow
|
| Purpose       Scripts for Gulp-based build process, including minimization, compilation, and dependency management.
|
>===============================================================================================================================
| Revisions     Date            Author                  Comments
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|               02.16.15        Jeremy Caney            Created initial version.
|               03.15.15        Jeremy Caney            Tested against revised directory structure
\-----------------------------------------------------------------------------------------------------------------------------*/

/*==============================================================================================================================
| DEPENDENCIES
\-----------------------------------------------------------------------------------------------------------------------------*/
  var   gulp                    = require("gulp"),
        gutil                   = require("gulp-util"),
        gulpif                  = require("gulp-if"),
        babel                   = require("gulp-babel"),
        sass                    = require("gulp-sass"),
        autoprefixer            = require('gulp-autoprefixer'),
        concat                  = require("gulp-concat"),
        uglify                  = require("gulp-uglify"),
        minifyHtml              = require("gulp-minify-html"),
        jsonminify              = require('gulp-jsonminify'),
        pngCrush                = require("imagemin-pngcrush"),
        minifyImg               = require("gulp-imagemin"),
        bower                   = require("bower"),
        livereload              = require('gulp-livereload'),
        notify                  = require("gulp-notify"),
        connect                 = require("gulp-connect");

/*==============================================================================================================================
| VARIABLES
\-----------------------------------------------------------------------------------------------------------------------------*/
  var   environment             = "development",
        sassStyle               = "expanded",                           // This is a SASS variable; assuming there’s a sass equivalent
        outputDir               = "Builds/Development/",
        isProduction            = false;

/*==============================================================================================================================
| SOURCE FILE PATHS
>-------------------------------------------------------------------------------------------------------------------------------
| Paths to files referenced in the build process. Path names may use any "magic" glob characters, as documented at
| https://github.com/isaacs/node-glob.
>-------------------------------------------------------------------------------------------------------------------------------
| ### NOTE: JJC021715: These paths are only intended for source files. Destination files will not use glob "magic", and will
| be conditional based on the outputDir. As a result, they will likely be hardcoded into each task's dest() method.
\-----------------------------------------------------------------------------------------------------------------------------*/
  var   sassFiles       = "Source/Styles/**/*.scss",
        sassMain        = "Source/Styles/Style.scss",
        es6Files        = "Source/Scripts/**/*.js",
        jsFiles         = "Builds/Development/Shared/Scripts/**/*.js",
        jsonFiles       = "Builds/Development/API/**/*.json",
        htmlFiles       = "Builds/Development/**/*.html",
        cssFiles        = "Builds/Development/Shared/Styles/**/*.css",
        imageFiles      = "Builds/Development/Images/**/*.*",
        fontFiles       = "Builds/Development/Shared/Fonts/**/*.*",
        staticFiles     = [];

/*==============================================================================================================================
| SET STATIC FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Sets location of static files not accounted for by other processes.
\-----------------------------------------------------------------------------------------------------------------------------*/
  staticFiles = [
    "Builds/Development/**/"
    ]

/*==============================================================================================================================
| SET ENVIRONMENT
>-------------------------------------------------------------------------------------------------------------------------------
| Looks for an environment variable and conditionally set local context accordingly.
\-----------------------------------------------------------------------------------------------------------------------------*/
  environment           = process.env.BUILD_ENVIRONMENT || "development";

//Environment: Development
  if (environment === "development") {
    outputDir           = "Builds/Development/";
    sassStyle           = "expanded";
    isProduction        = false;
    }

//Environment: Production
  else {
    outputDir           = "Builds/Production/";
    sassStyle           = "compressed";
    isProduction        = true;
    }

/*==============================================================================================================================
| TASK: DEFAULT
>-------------------------------------------------------------------------------------------------------------------------------
| The default task when Gulp runs, assuming no task is specified. Assuming the environment variable isn't explicitly defined
| otherwise, will run on development-oriented tasks.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("default", ["server", "static", "watch"]);

/*==============================================================================================================================
| TASK: SERVER
>-------------------------------------------------------------------------------------------------------------------------------
| Establishes a server connection via connect and instantiates LiveReload for automatic refresh.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("server", function() {
    connect.server({
      root: outputDir,
      livereload: true
      });
    });

/*==============================================================================================================================
| TASK: WATCH
>-------------------------------------------------------------------------------------------------------------------------------
| Watches primary development files, and automatically runs the build process when any are modified.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("watch", function() {
    gulp.watch(sassFiles,       ["sass"]);
    gulp.watch(es6Files,        ["es6"]);
  //gulp.watch(jsFiles,         ["js"]);
  //gulp.watch(jsonFiles,       ["json"]);
  //gulp.watch(htmlFiles,       ["html"]);
  //gulp.watch(imageFiles,      ["images"]);
  //gulp.watch(cssFiles,        ["css"]);
  //gulp.watch(fontFiles,       ["fonts"]);
  //gulp.watch(staticFiles,     ["static"]);

  //Create LiveReload server, and respond to changes
    livereload.listen();

    gulp.watch(['Builds/Development/**/*']).on('change', livereload.changed);

    });

/*==============================================================================================================================
| TASK: BUILD
>-------------------------------------------------------------------------------------------------------------------------------
| Builds all current files.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("build", [

    "static",

    "fonts",
    "html",
    "images",
    "css",
    "js",
    "json",

    "sass",
    "es6"

    ]);

/*==============================================================================================================================
| TASK: HTML FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Compresses HTML files.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("html", function() {
    if (!isProduction) return;
    gulp.src(htmlFiles)
      .pipe(gulpif(isProduction, minifyHtml()))
      .pipe(gulp.dest(outputDir))
      .pipe(notify({ message: 'HTML task complete' }));
    });

/*==============================================================================================================================
| TASK: sass FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Compiles sass files and moves them to the build directory.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("sass", function() {
    gulp.src(sassFiles)
      .pipe(sass({}).on("error", gutil.log))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    //.pipe(gulpif(isProduction, minifycss()))
    //.pipe(gulpif(isProduction, rename({ suffix: '.min' })))
      .pipe(gulp.dest(outputDir + "/Shared/Styles/"))
      .pipe(notify({ message: 'sass task complete' }));
    });

/*==============================================================================================================================
| TASK: CSS FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Minifies CSSfiles and moves them to the build directory.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("css", function() {
    if (!isProduction) return;
    gulp.src(sassFiles)
    //.pipe(minifycss())
    //.pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(outputDir + "/Shared/Styles/"))
      .pipe(notify({ message: 'CSS task complete' }));
    });

/*==============================================================================================================================
| TASK: FONT FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Moves font files to the build directory.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("fonts", function() {
    if (!isProduction) return;
    gulp.src(fontFiles)
      .pipe(gulp.dest(outputDir + "/Shared/Fonts/"))
      .pipe(notify({ message: 'Fonts task complete' }));
    });

/*==============================================================================================================================
| TASK: ECMASCRIPT 2015 FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Transpiles ECMAScript 2015 (6.0) files into ECMAScript 5.0 files for backward compatibility.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("es6", function() {
    gulp.src(es6Files)
      .pipe(babel().on("error", gutil.log))
    //.pipe(jshint('.jshintrc'))
    //.pipe(jshint.reporter('default'))
      .pipe(concat("Script.js"))
      .pipe(gulp.dest(outputDir + "/Shared/Scripts/"))
      .pipe(notify({ message: 'ES6 task complete' }));
    });

/*==============================================================================================================================
| TASK: JAVASCRIPT FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Minimizes JavaScript files as part of production process.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("js", function() {
    if (!isProduction) return;
    gulp.src(jsFiles)
    //.pipe(jshint('.jshintrc'))
    //.pipe(jshint.reporter('default'))
    //.pipe(concat("Scripts.js"))
    //.pipe(bower())
      .pipe(uglify())
      .pipe(gulp.dest(outputDir + "/Shared/Scripts/"))
      .pipe(notify({ message: 'JavaScript task complete' }));
    });

/*==============================================================================================================================
| TASK: JSON FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Minimizes JSON files as part of production process.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("json", function() {
    if (!isProduction) return;
    gulp.src(jsonFiles)
      .pipe(jsonminify())
      .pipe(gulp.dest(outputDir + "/API/"))
      .pipe(notify({ message: 'JSON task complete' }));
    });


/*==============================================================================================================================
| TASK: IMAGE FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Minifies (compresses) image files as part of production process.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("images", function() {
    if (!isProduction) return;
    gulp.src(imageFiles)
      .pipe(minifyImg({
        progressive: true,
        svgPlugins: [{}],
        use: [pngCrush()]
        }))
      .pipe(gulp.dest(outputDir + "/Images/"))
      .pipe(notify({ message: 'Image task complete' }));
    });

/*==============================================================================================================================
| TASK: STATIC FILES
>-------------------------------------------------------------------------------------------------------------------------------
| Moves static files to the build directory.
\-----------------------------------------------------------------------------------------------------------------------------*/
  gulp.task("static", function() {
    if (!isProduction) return;
    gulp.src(staticFiles)
      .pipe(gulp.dest(outputDir + "/"))
      .pipe(notify({ message: 'Static task complete' }));
    });

