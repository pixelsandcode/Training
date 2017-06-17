var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var template = require('gulp-template')
var data = require('gulp-data')
var argv = require('yargs')
.alias('n', 'name')
.argv

gulp.task('default', () => {

  console.log("usage:" + '\n' +
  "gulp                     <for help.>" + '\n' +
  "gulp start               <for start hapi server whit nodemon.>" + '\n' +
  "gulp create --[name]     <for start a new project from temp.>"
  )

})

gulp.task('start', () => {

  nodemon({
    script: 'src/server.js'
  , ext: 'js'
  })

})

gulp.task('create', () => {

  gulp.src('temp/package.json')
    .pipe(data(() => ({name: argv.name})))
    .pipe(template())
    .pipe(gulp.dest( argv.name ))

})
