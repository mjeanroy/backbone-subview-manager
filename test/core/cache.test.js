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

import {Cache} from '../../src/core/cache';

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache();
  });

  it('should initialize cache', () => {
    expect(cache.size).toBe(0);
  });

  it('should add element in cache', () => {
    const id = 'foo';
    const value = {};

    expect(cache.has(id)).toBe(false);
    expect(cache.get(id)).toBeUndefined();
    expect(cache.size).toBe(0);

    cache.set(id, value);

    expect(cache.has(id)).toBe(true);
    expect(cache.get(id)).toBe(value);
    expect(cache.size).toBe(1);
  });

  it('should add and remove element in cache', () => {
    const k1 = 'foo';
    const v1 = {};
    const k2 = 'bar';
    const v2 = {};

    cache.set(k1, v1);
    cache.set(k2, v2);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v1);
    expect(cache.has(k2)).toBe(true);
    expect(cache.get(k2)).toBe(v2);
    expect(cache.size).toBe(2);

    cache.delete(k1);

    expect(cache.has(k1)).toBe(false);
    expect(cache.get(k1)).toBeUndefined();
    expect(cache.has(k2)).toBe(true);
    expect(cache.get(k2)).toBe(v2);
    expect(cache.size).toBe(1);
  });

  it('should not try to remove unexisting key', () => {
    const k1 = 'foo';
    const v1 = {};
    const k2 = 'bar';

    cache.set(k1, v1);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v1);
    expect(cache.has(k2)).toBe(false);
    expect(cache.get(k2)).toBeUndefined();
    expect(cache.size).toBe(1);

    cache.delete(k2);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v1);
    expect(cache.has(k2)).toBe(false);
    expect(cache.get(k2)).toBeUndefined();
    expect(cache.size).toBe(1);
  });

  it('should clear cache', () => {
    const k1 = 'foo';
    const v1 = {};
    const k2 = 'bar';
    const v2 = {};

    cache.set(k1, v1);
    cache.set(k2, v2);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v1);
    expect(cache.has(k2)).toBe(true);
    expect(cache.get(k2)).toBe(v2);
    expect(cache.size).toBe(2);

    cache.clear();

    expect(cache.has(k1)).toBe(false);
    expect(cache.get(k1)).toBeUndefined();
    expect(cache.has(k2)).toBe(false);
    expect(cache.get(k2)).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('should override element in cache', () => {
    const k1 = 'foo';
    const v1 = {};
    const v2 = {};

    cache.set(k1, v1);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v1);
    expect(cache.size).toBe(1);

    cache.set(k1, v2);

    expect(cache.has(k1)).toBe(true);
    expect(cache.get(k1)).toBe(v2);
    expect(cache.size).toBe(1);
  });

  it('should execute callback for each element in the cache', () => {
    const iteratee = jasmine.createSpy('iteratee');
    const k1 = 'foo';
    const v1 = {};
    const k2 = 'bar';
    const v2 = {};

    cache.set(k1, v1);
    cache.set(k2, v2);
    cache.forEach(iteratee);

    expect(iteratee.calls.count()).toBe(2);

    const call1 = iteratee.calls.all()[0];
    expect(call1.args[0]).toBe(v1);
    expect(call1.args[1]).toBe(k1);

    const call2 = iteratee.calls.all()[1];
    expect(call2.args[0]).toBe(v2);
    expect(call2.args[1]).toBe(k2);
  });

  it('should execute callback for removed elements', () => {
    const iteratee = jasmine.createSpy('iteratee');
    const k1 = 'foo';
    const v1 = {};
    const k2 = 'bar';
    const v2 = {};

    cache.set(k1, v1);
    cache.set(k2, v2);
    cache.delete(k1);
    cache.forEach(iteratee);

    expect(iteratee).toHaveBeenCalled();
    expect(iteratee.calls.count()).toBe(1);

    const call = iteratee.calls.all()[0];
    expect(call.args[0]).toBe(v2);
    expect(call.args[1]).toBe(k2);
  });
});
