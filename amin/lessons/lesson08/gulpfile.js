'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

gulp.task('build', () => {
  gulp.src('src/*.js')
    //.pipe(jade())
    //.pipe(minify())
    .pipe(gulp.dest('build'))
})

gulp.task('start', () => {
  const stream = nodemon({
    script: 'src/index.js',
    ext: 'html js',
    ignore: ['ignored.js'],
    tasks: ['build']
  })
})