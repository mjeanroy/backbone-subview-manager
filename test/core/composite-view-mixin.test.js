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
import {CompositeViewMixin} from '../../src/core/composite-view-mixin';

describe('CompositeViewMixin', () => {
  let view;

  beforeEach(() => {
    const ViewImpl = Backbone.View.extend(CompositeViewMixin);
    view = new ViewImpl();
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

    const result = view.addSubViews(subview);

    expect(result).toBe(view);
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    view.removeSubViews(subview);

    expect(view._subviews.get(cid)).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should init subview and remove it', () => {
    const subview = view.initSubView(Backbone.View);

    expect(subview).toBeDefined();
    expect(subview).not.toBe(view);
    expect(subview instanceof Backbone.View).toBe(true);

    const cid = subview.cid;
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    view.removeSubViews(subview);

    expect(view._subviews.get(cid)).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should add array of subviews', () => {
    const subview1 = new Backbone.View();
    const cid1 = subview1.cid;

    const subview2 = new Backbone.View();
    const cid2 = subview2.cid;

    const result = view.addSubViews([subview1, subview2]);

    expect(result).toBe(view);
    expect(view._subviews.get(cid1)).toBe(subview1);
    expect(view._subviews.get(cid2)).toBe(subview2);
    expect(view._hasSubViews()).toBe(true);
  });

  it('should add and remove subview using cid', () => {
    const subview = new Backbone.View();
    const cid = subview.cid;

    const r1 = view.addSubViews(subview);

    expect(r1).toBe(view);
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    const r2 = view.removeSubViews(cid);

    expect(r2).toBe(view);
    expect(view._subviews.get(cid)).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should remove subview when subview trigger the remove event', () => {
    const subview = new Backbone.View();
    const cid = subview.cid;

    const r1 = view.addSubViews(subview);

    expect(r1).toBe(view);
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    subview.trigger('remove');

    expect(view._subviews.get(cid)).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should remove subview when subview trigger the dispose event', () => {
    const subview = new Backbone.View();
    const cid = subview.cid;

    const r1 = view.addSubViews(subview);

    expect(r1).toBe(view);
    expect(view._subviews.get(cid)).toBe(subview);
    expect(view._hasSubViews()).toBe(true);

    subview.trigger('dispose');

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

    const result = view.removeSubViews(subview);

    expect(result).toBe(view);
    expect(view._subviews).not.toBeDefined();
    expect(view._hasSubViews()).toBe(false);
  });

  it('should attach subviews', () => {
    const SubView = Backbone.View.extend({
      initialize(options) {
        this._el = options.el;
        this._idx = options.idx;
      },
    });

    view.setElement($('<div><span>#1</span><span>#2</span></div>'));

    const factory = jasmine.createSpy('factory').and.callFake((opts) => {
      const subview = new SubView(opts);
      subview.$el.attr('cid', subview.cid);
      return subview;
    });

    const result = view.attachSubViews('span', factory);

    expect(result).toBe(view);
    expect(view._hasSubViews()).toBe(true);
    expect(view._subviews.size).toBe(2);

    const span = view.$el.find('span');
    const span1 = span.eq(0);
    const span2 = span.eq(1);

    expect(factory).toHaveBeenCalledWith({
      el: span1.get(0),
      idx: 0,
    });

    expect(factory).toHaveBeenCalledWith({
      el: span2.get(0),
      idx: 1,
    });

    const cid1 = span1.attr('cid');
    const subview1 = view._subviews.get(cid1);

    const cid2 = span2.attr('cid');
    const subview2 = view._subviews.get(cid2);

    expect(subview1).toBeDefined();
    expect(subview1._idx).toBe(0);
    expect(subview1._el).toEqual(span1.get(0));
    expect(subview1.el).toEqual(span1.get(0));

    expect(subview2).toBeDefined();
    expect(subview2._idx).toBe(1);
    expect(subview2._el).toEqual(span2.get(0));
    expect(subview2.el).toEqual(span2.get(0));
  });

  it('should not try to attach without matched elements', () => {
    const SubView = Backbone.View.extend({
      initialize(options) {
        this._el = options.el;
        this._idx = options.idx;
      },
    });

    view.setElement($('<div></div>'));

    const factory = jasmine.createSpy('factory').and.callFake((opts) => {
      const subview = new SubView(opts);
      subview.$el.attr('cid', subview.cid);
      return subview;
    });

    const result = view.attachSubViews('span', factory);

    expect(result).toBe(view);
    expect(view._hasSubViews()).toBe(false);
    expect(factory).not.toHaveBeenCalled();
  });

  it('should get subview', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();

    view.addSubViews([subview1, subview2]);

    expect(view.getSubView(subview1.cid)).toBe(subview1);
    expect(view.getSubView(subview2.cid)).toBe(subview2);
  });

  it('should get and return subview', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();

    view.addSubViews([subview1, subview2]);

    expect(view.getSubView(subview1)).toBe(subview1);
    expect(view.getSubView(subview2)).toBe(subview2);
  });

  it('should try to get subview and return null without cid', () => {
    const subview1 = new Backbone.View();
    expect(view.getSubView(subview1)).toBe(null);
  });

  it('should try to get subview and return null without subview', () => {
    expect(view.getSubView('foo')).toBe(null);
  });

  it('should try to get subview and return null without valid parameter', () => {
    expect(view.getSubView(null)).toBe(null);
    expect(view.getSubView(undefined)).toBe(null);
  });

  it('should get all subviews', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();
    view.addSubViews([
      subview1,
      subview2,
    ]);

    const subviews = view.getSubViews();

    expect(subviews.length).toBe(2);
    expect(subviews).toContain(subview1);
    expect(subviews).toContain(subview2);
  });

  it('should try to get all subviews and return empty array without subviews', () => {
    const subviews = view.getSubViews();
    expect(subviews).toEqual([]);
  });
});
