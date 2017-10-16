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
    view.initializeSubViews();
    expect(view._subviews).toBeDefined();
  });

  it('should add and remove subviews', () => {
    const subview = new Backbone.View();
    const cid = subview.cid;

    view.addSubView(subview);
    expect(view._subviews.get(cid)).toBe(subview);

    view.removeSubView(subview);
    expect(view._subviews.get(cid)).not.toBeDefined();
  });

  it('should add multiple subviews', () => {
    const subview1 = new Backbone.View();
    const subview2 = new Backbone.View();
    const cid1 = subview1.cid;
    const cid2 = subview2.cid;

    view.addSubView(subview1);
    view.addSubView(subview2);

    expect(view._subviews.get(cid1)).toBe(subview1);
    expect(view._subviews.get(cid2)).toBe(subview2);
  });

  it('should stop to listen to view events when removed', () => {
    const subview = new Backbone.View();
    const spy = jasmine.createSpy('spy');
    const evt = 'evt';

    view.listenTo(subview, evt, spy);
    view.addSubView(subview);
    subview.trigger(evt);
    expect(spy).toHaveBeenCalled();

    spy.calls.reset();

    view.removeSubView(subview);
    subview.trigger(evt);
    expect(spy).not.toHaveBeenCalled();
  });
});
