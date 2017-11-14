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

import Backbone from 'backbone';
import {parseCid} from '../../src/core/parse-cid';

describe('parseCid', () => {
  it('should return null or undefined', () => {
    expect(parseCid(null)).toBe(null);
    expect(parseCid(undefined)).toBe(null);
    expect(parseCid(void 0)).toBe(null);
  });

  it('should return string', () => {
    expect(parseCid('_cid1')).toBe('_cid1');
    expect(parseCid('')).toBe('');
  });

  it('should return view cid', () => {
    const view = new Backbone.View();
    const cid = view.cid;

    expect(cid).toBeTruthy();
    expect(parseCid(view)).toBe(cid);
  });

  it('should return null for object without cid', () => {
    expect(parseCid({})).toBe(null);
  });
});
