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
import {CompositeView} from '../../src/core/composite-view';

describe('CompositeView', () => {
  let view;

  beforeEach(() => {
    view = new CompositeView();
  });

  it('should initialize subviews', () => {
    expect(view._subviews).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);

    const result = view.initializeSubViews();

    expect(result).toBe(view);
    expect(view._subviews).toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should add and remove subviews', () => {
    const subview = new Backbone.View();
    const cid = subview.cid;

    const r1 = view.addSubViews(subview);

    expect(r1).toBe(view);
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    const r2 = view.removeSubViews(subview);

    expect(r2).toBe(view);
    expect(view._subviews.get(cid)).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should add multiple subviews', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();
    const cid1 = subview1.cid;
    const cid2 = subview2.cid;

    view.addSubViews(subview1);
    view.addSubViews(subview2);

    expect(view._subviews.get(cid1)).toBe(subview1);
    expect(view._subviews.get(cid2)).toBe(subview2);
    expect(view._hasSubViews()).toBe(true);
  });

  it('should stop to listen to view events when removed', () => {
    const subview = new Backbone.View();
    const spy = jasmine.createSpy('spy');
    const evt = 'evt';

    view.listenTo(subview, evt, spy);
    view.addSubViews(subview);
    subview.trigger(evt);
    expect(spy).toHaveBeenCalled();

    spy.calls.reset();

    view.removeSubViews(subview);
    subview.trigger(evt);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should remove all subviews', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();

    view.addSubViews(subview1);
    view.addSubViews(subview2);

    expect(view._subviews.get(subview1.cid)).toBe(subview1);
    expect(view._subviews.get(subview2.cid)).toBe(subview2);
    expect(view._hasSubViews()).toBe(true);

    const result = view.removeSubViews();

    expect(result).toBe(view);
    expect(view._subviews.get(subview1.cid)).toBeUndefined();
    expect(view._subviews.get(subview2.cid)).toBeUndefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should not try to remove all subviews if view does not have subviews', () => {
    expect(view._hasSubViews()).toBe(false);
    expect(view._subviews).not.toBeDefined();

    const result = view.removeSubViews();

    expect(result).toBe(view);
    expect(view._subviews).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should not try to remove subview if view does not have subviews', () => {
    const subview = new Backbone.View();

    expect(view._subviews).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);

    view.removeSubViews(subview);

    expect(view._subviews).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should remove subviews when view is removed', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();

    spyOn(subview1, 'remove').and.callThrough();
    spyOn(subview2, 'remove').and.callThrough();
    spyOn(view, 'removeSubViews').and.callThrough();

    view.addSubViews(subview1);
    view.addSubViews(subview2);

    expect(subview1.remove).not.toHaveBeenCalled();
    expect(subview2.remove).not.toHaveBeenCalled();
    expect(view.removeSubViews).not.toHaveBeenCalled();

    view.remove();

    expect(subview1.remove).toHaveBeenCalled();
    expect(subview2.remove).toHaveBeenCalled();
    expect(view.removeSubViews).toHaveBeenCalled();
  });

  it('should not try to remove subviews when view is removed and view does not have subviews', () => {
    spyOn(view, 'removeSubViews').and.callThrough();

    view.remove();

    expect(view.removeSubViews).toHaveBeenCalled();
    expect(view._subviews).not.toBeDefined();
  });
});
