/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2018 Mickael Jeanroy
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

const fs = require('fs-extra');
const path = require('path');
const babel = require('babel-core');
const gulp = require('gulp');
const rollup = require('rollup');
const alias = require('rollup-plugin-alias');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const gls = require('gulp-live-server');

const log = require('../log');
const conf = require('../conf');
const babelConf = require('../babel.conf');
const build = require('../build');

/**
 * Create the sample bundle.
 *
 * @return {Promise} The done promise.
 */
function generateSampleBundle() {
  log.debug(`Running rollup...`);

  const rollupConf = {
    input: path.join(conf.sample, 'app.js'),

    output: {
      format: 'iife',
      name: 'Sample',
    },

    plugins: [
      alias({
        'backbone-subview-manager': path.join(conf.dist, conf.bundle),
      }),

      nodeResolve({
        jsnext: true,
        main: true,
      }),

      commonjs(),
    ],
  };

  return generateBundle(rollupConf)
      .then((code) => createES5Bundle(code))
      .catch((err) => log.error(err));
}

/**
 * Generate bundle "in memory".
 *
 * @param {Object} rollupConf The rollup configuration.
 * @return {Promise<string>} The generated bundle code.
 */
function generateBundle(rollupConf) {
  return rollup.rollup(rollupConf)
      .then((bundle) => generateESMBundle(bundle, rollupConf))
      .then((result) => result.code);
}

/**
 * Generate ESM bundle "in memory" (i.e this function returns a promise
 * with given result).
 *
 * @param {*} bundle The rollup bundle.
 * @param {Object} rollupConf The rollup configuration.
 * @return {Promise<RollupBuild>} The rollup result.
 */
function generateESMBundle(bundle, rollupConf) {
  log.debug(`Generating ES6 bundle`);
  return bundle.generate(rollupConf);
}

/**
 * Generate ES5 bundle with babel.
 *
 * @param {string} code The ES2015 code.
 * @return {void}
 */
function createES5Bundle(code) {
  log.debug(`Generating ES5 bundle`);

  const dir = path.join(conf.sample, '.tmp');
  const dest = path.join(dir, 'bundle.js');
  const es5 = babel.transform(code, babelConf);

  log.debug(`Writing ES5 bundle to: ${dest}`);

  return fs.outputFile(dest, es5, 'utf-8');
}

module.exports = function serve() {
  return generateSampleBundle().then(() => {
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

    /**
     * Rebuild dist file when a source file is updated.
     *
     * @param {*} done The `done` callback.
     * @return {void}
     */
    function onChangeSrcFiles(done) {
      log.debug(`Change detected in source files, rebuild`);
      build(done);
    }

    /**
     * Rebuild sample bundle when dist file is updated.
     *
     * @return {Promise<Void>} The done promise.
     */
    function onChangeDistFiles() {
      log.debug(`Change detected in dist files, bundle app`);
      return generateSampleBundle();
    }

    /**
     * Rebuild sample when sample source files are updated.
     *
     * @return {Promise<Void>} The done promise.
     */
    function onChangeSampleApp() {
      log.debug(`Change detected in sample, bundle app`);
      return generateSampleBundle();
    }

    /**
     * Reload sample application when a change is detected.
     *
     * @param {function} done The `done` callback.
     * @return {void}
     */
    function onChangeStaticFiles(done) {
      log.info(`Change detected, notify server`);
      server.notify();
      done();
    }

    gulp.watch(srcFiles, onChangeSrcFiles);
    gulp.watch(distFiles, onChangeDistFiles);
    gulp.watch([sampleFiles, `!${bundles}`], onChangeSampleApp);
    gulp.watch([bundles, htmlFiles, cssFiles], onChangeStaticFiles);
  });
};
