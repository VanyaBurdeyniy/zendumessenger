var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify');

const options = {
    entries:'./app/app.js',
    extensions:['.js', '.jsx'],
    debug:true
};

gulp.task('build',()=>{
    return browserify(options)
        .transform('babelify',{presets:['es2015','react']})
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./js'))
});

gulp.task('watch', ['build'], () =>{
    gulp.watch(['./app/**/*.jsx','./app/**/*.js'], ['build']);
});