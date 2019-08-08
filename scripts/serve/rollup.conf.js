const path = require('path');
const alias = require('rollup-plugin-alias');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const conf = require('../conf');

module.exports = {
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
      mainFields: [
        'module',
        'jsnext:main',
        'main',
      ],
    }),

    commonjs(),
  ],
};
