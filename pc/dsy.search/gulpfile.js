var gulp = require('gulp'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

var path = {
    src: ['./dsy/search/1.2.2/*.js', './dsy/util/1.1.2/historyUtil.js'],
    dest: './build',
    maps: './maps'
}

gulp.task('clean', function(cb) {
    return del([path.dest], cb);
});

gulp.task('uglify', ['clean'], function() {
    return gulp.src(path.src, {
        base: '.'
    })
        // .pipe(sourcemaps.init())
        .pipe(uglify({
            mangle: false,
            output: { ascii_only: true }
        }))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dest));
});

gulp.task('copy', ['clean'], function() {
    return gulp.src('./dsy/main122.js', {
        base: '.'
    }).pipe(gulp.dest(path.dest));
});

gulp.task('default', ['uglify', 'copy'], function() {});
