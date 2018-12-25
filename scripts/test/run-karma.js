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

const path = require('path');
const karma = require('karma');
const log = require('../log');

/**
 * Run tests with Karma.
 *
 * @param {string} mode Test mode.
 * @param {function} done The done callback.
 * @return {void}
 */
module.exports = function runKarma(mode, done) {
  const configFile = path.join(__dirname, `karma.${mode}.conf.js`);
  const config = {configFile};
  const srv = new karma.Server(config, (err) => {
    log.debug('Calling done callback of Karma');
    done(err);
  });

  log.debug(`Running Karma server with configuration: ${configFile}`);
  srv.start();
};
