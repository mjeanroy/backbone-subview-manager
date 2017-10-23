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

const fs = require('fs');
const path = require('path');
const del = require('del');
const babelCore = require('babel-core');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const karma = require('karma');
const gutil = require('gulp-util');
const Q = require('q');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const headerComment = require('gulp-header-comment');
const stripBanner = require('gulp-strip-banner');
const rename = require('gulp-rename');
const bump = require('gulp-bump');
const tagVersion = require('gulp-tag-version');
const git = require('gulp-git');
const KarmaServer = karma.Server;
const rollup = require('rollup');
const alias = require('rollup-plugin-alias');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const gls = require('gulp-live-server');

const conf = require('./conf');
const rollupConf = require('./rollup.conf');
const uglifyConf = require('./uglify.conf');
const babelConf = require('./babel.conf');

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

gulp.task('travis', () => {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    gutil.log(gutil.colors.grey('SauceLab environment not set, running classic test suite'));
    return runKarma('test');
  }

  return runKarma('saucelab');
});

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

['minor', 'major', 'patch'].forEach((type) => {
  const ROOT = conf.root;
  const PKG_JSON = path.join(ROOT, 'package.json');
  const DIST = conf.dist;

  gulp.task(`bump:${type}`, () => (
    gulp.src(PKG_JSON)
      .pipe(bump({type}))
      .pipe(gulp.dest(ROOT))
  ));

  gulp.task(`commit:${type}`, ['build', `bump:${type}`], () => (
    gulp.src([PKG_JSON, DIST])
      .pipe(git.add({args: '-f'}))
      .pipe(git.commit('release: release version'))
  ));

  gulp.task(`tag:${type}`, [`commit:${type}`], () => (
    gulp.src([PKG_JSON]).pipe(tagVersion())
  ));

  gulp.task(`release:${type}`, [`tag:${type}`], () => (
    gulp.src([DIST])
      .pipe(git.rm({args: '-r'}))
      .pipe(git.commit('release: prepare next release'))
  ));
});

gulp.task('serve', ['build'], () => {
  return sampleBundle().then(() => {
    const main = path.join(conf.sample, 'server.js');
    const server = gls.new(main);

    // Start server.
    server.start();

    const srcFiles = path.join(conf.src, '**', '*.js');
    const distFiles = path.join(conf.dist, '**', '*.js');
    const sampleFiles = path.join(conf.sample, '**', '*.js');
    const bundles = path.join(conf.sample, '**', '.tmp', '*.js');
    const htmlFiles = path.join(conf.sample, '**', '*.html');
    const cssFiles = path.join(conf.sample, '**', '*.css');

    // Rebuild dist file when a source file is updated.
    gulp.watch(srcFiles, () => {
      gutil.log(gutil.colors.gray(`Change detected in source files, rebuild`));
      gulp.start('build');
    });

    // Rebuild sample bundle when dist file is updated.
    gulp.watch(distFiles, () => {
      gutil.log(gutil.colors.gray(`Change detected in dist files, bundle app`));
      sampleBundle();
    });

    // Rebuild sample when sample source files are updated.
    gulp.watch([sampleFiles, `!${bundles}`], () => {
      gutil.log(gutil.colors.gray(`Change detected in sample, bundle app`));
      sampleBundle();
    });

    // Reload when bundle app is updated.
    gulp.watch([bundles, htmlFiles, cssFiles], () => {
      gutil.log(gutil.colors.green(`Change detected, notify server`));
      server.notify();
    });
  });
});

/**
 * Create the sample bundle.
 *
 * @return {Promise} The done promise.
 */
function sampleBundle() {
  gutil.log(gutil.colors.gray(`Running rollup...`));

  const rollupConf = {
    input: path.join(conf.sample, 'app.js'),
    format: 'iife',
    name: 'Sample',
    plugins: [
      alias({
        'backbone-subview-manager': path.join(conf.dist, 'backbone-subview-manager.js'),
      }),

      nodeResolve({
        jsnext: true,
        main: true,
      }),

      commonjs(),
    ],
  };

  return rollup.rollup(rollupConf)
    .then((bundle) => {
      gutil.log(gutil.colors.gray(`Generating ES6 bundle`));

      bundle.generate(rollupConf).then((result) => {
        gutil.log(gutil.colors.gray(`Generating ES5 bundle`));

        const dir = path.join(conf.sample, '.tmp');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const dest = path.join(conf.sample, '.tmp', 'bundle.js');
        const es5 = babelCore.transform(result.code, babelConf);

        gutil.log(gutil.colors.gray(`Writing ES5 bundle to: ${dest}`));
        fs.writeFileSync(dest, es5.code, 'utf-8');
      });
    })
    .catch((err) => {
      gutil.log(gutil.colors.red(err));
    });
}

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
}
