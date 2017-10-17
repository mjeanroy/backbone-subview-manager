/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require('path');
const del = require('del');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const karma = require('karma');
const gutil = require('gulp-util');
const Q = require('q');
const rollup = require('rollup');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const headerComment = require('gulp-header-comment');
const stripBanner = require('gulp-strip-banner');
const rename = require('gulp-rename');
const KarmaServer = karma.Server;
const conf = require('./conf');
const rollupConf = require('./rollup.conf');
const uglifyConf = require('./uglify.conf');

gulp.task('clean', () => {
  return del(conf.dist);
});

gulp.task('lint', () => {
  const sources = [
    path.join(conf.root, '*.js'),
    path.join(conf.src, '**/*.js'),
    path.join(conf.test, '**/*.js'),
  ];

  return gulp.src(sources)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

['test', 'tdd'].forEach((mode) => {
  gulp.task(mode, () => {
    return runKarma(mode);
  });
});

gulp.task('travis', ['test']);

gulp.task('build', ['clean'], () => {
  return applyRollup(rollupConf)
    .then((src) => {
      gutil.log(gutil.colors.gray(`Creating ES5 bundle`));
      return gulp.src(src)
        .pipe(stripBanner())
        .pipe(babel())
        .pipe(headerComment({file: conf.license}))
        .pipe(gulp.dest(path.join(conf.dist, 'es5')))
        .pipe(uglify(uglifyConf))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(path.join(conf.dist, 'es5')));
    });
});

/**
 * Run tests with Karma.
 *
 * @param {string} mode Test mode.
 * @return {Promise} The done promise.
 */
function runKarma(mode) {
  const configFile = path.join(conf.root, `karma.${mode}.conf.js`);
  const deferred = Q.defer();
  const onDone = () => deferred.resolve();
  const config = {configFile};

  gutil.log(gutil.colors.gray(`Running Karma server with configuration: ${configFile}`));

  const server = new KarmaServer(config, onDone);
  server.start();
  return deferred.promise;
}

/**
 * Apply rollup.
 *
 * @param {Object} config Rollup configuration.
 * @return {Promise} The done promise.
 */
function applyRollup(config) {
  gutil.log(gutil.colors.gray(`Rollup entry point`));
  return rollup.rollup(config).then((bundle) => {
    gutil.log(gutil.colors.gray(`Writing rollup bundle`));
    return bundle.write(config.output).then(() => config.output.file);
  });
};
