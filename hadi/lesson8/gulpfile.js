/**
 * Created by hadi on 2/14/17.
 */
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var nodemon = require('gulp-nodemon');
var minify = require('gulp-minify');

gulp.task('start', function () {
  nodemon({
    script: './src/server.coffee',
    ext: 'coffee html'
  })
});

gulp.task('build', function () {
  gulp.src('./src/*.coffee')
      .pipe(coffee())
      .pipe(minify())
      .pipe(gulp.dest('./build'));

});