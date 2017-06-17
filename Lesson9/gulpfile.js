var gulp = require('gulp')
var nodemon = require('gulp-nodemon')

gulp.task('default', () => {
  console.log('at src directory rum ./index.js -h for help.' +
    '\n' +
    'read readme.md' + '\n')
})

gulp.task('start', () => {

  nodemon({
    script: 'src/server.js',
    ext: 'js'
  })

})
