var gulp = require('gulp')
var babel = require('gulp-babel')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var exec = require('child_process').exec
var browserSync = require('browser-sync').create()
var spawn = require('child_process').spawn
var concat = require('gulp-concat')
var async = require('async')

var jsMap = [
  {
    output: 'player.js',
    input: [
      './jsx/Player.js'
    ]
  },
  {
    output: 'remote.js',
    input: [
      './jsx/background.js',
      './jsx/Library.js',
      './jsx/SharedState.js',
      './jsx/Remote.js',
      './jsx/Matrix.js',
      './jsx/Column.js',
      './jsx/Row.js',
      './jsx/Tracks.js',
      './jsx/Info.js',
      './jsx/Playlist.js',
      './jsx/Controls.js',
      './jsx/Yamp.js'
    ]
  }
]

gulp.task('jsx', (callback) => {
  async.eachSeries(jsMap, (item, cb) => {
    gulp.src(item.input)
      .pipe(babel({
        presets: ['es2015', 'react']
      })).on('error', function(err) {
        console.log(err.codeFrame)
        this.emit('end')
      })
      .pipe(concat(item.output))
      .pipe(gulp.dest('./public/js'))
      .on('end', cb)
  }, callback)
})

gulp.task('browser-sync', () => {
  browserSync.init({
    proxy: "localhost:8000",
    ws: true
  })
})

gulp.task('sass', () => {
  gulp.src('./sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['./bower_components/foundation-sites/scss', './bower_components/motion-ui/src']
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
})

gulp.task('watch', ['browser-sync', 'jsx', 'sass'], () => {
    gulp.watch('./jsx/**/*', ['jsx'])
    gulp.watch('./sass/**/*.scss', ['sass'])
    gulp.watch(['./public/css/**/*', './public/js/**/*', 'views/**/*']).on('change', () => {
      setTimeout(browserSync.reload, 1000)
    })
})
