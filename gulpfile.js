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

/* eslint-env node */

const gulp = require('gulp');
const clean = require('./scripts/clean');
const lint = require('./scripts/lint');
const build = require('./scripts/build');
const test = require('./scripts/test/test');
const tdd = require('./scripts/test/tdd');
const travis = require('./scripts/test/travis');
const serve = require('./scripts/serve');
const release = require('./scripts/release');

module.exports = {
  'clean': clean,
  'lint': lint,
  'build': gulp.series(clean, lint, build),
  'serve': gulp.series(clean, build, serve),
  'tdd': tdd,
  'test': gulp.series(clean, lint, test),
  'travis': gulp.series(lint, travis),
  'release:patch': gulp.series(clean, lint, build, test, release.patch),
  'release:minor': gulp.series(clean, lint, build, test, release.minor),
  'release:major': gulp.series(clean, lint, build, test, release.major),
};
