const gulp = require('gulp');
const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint');
const minifier = require('gulp-uglify/minifier');
const pump = require('pump');

gulp.task('compress', function () {
  var options = {
    preserveComments: 'license'
  };
  pump([
      gulp.src('lib/*.js'),
      minifier(options, uglify),
      gulp.dest('dist')
    ]);
});

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['lint', 'compress']);
