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

import {Cache} from './cache';
import {forEach, isNull, result} from './utils';
import {isNil} from './is-nil';
import {castArray} from './cast-array';
import {parseCid} from './parse-cid';

export const CompositeViewMixin = {
  /**
   * Initialize subviews entries.
   *
   * @return {this} The view (for chaining).
   */
  initializeSubViews() {
    this._subviews = new Cache();
    return this;
  },

  /**
   * Register subview.
   *
   * @param {Object|Array<Object>} views The view (or array of views).
   * @return {this} The view (for chaining).
   */
  addSubViews(views) {
    const array = castArray(views);

    if (array.length > 0) {
      this._ensureSubViews();

      forEach(array, (view) => {
        this._addSubView(view);
      });
    }

    return this;
  },

  /**
   * Register subview.
   *
   * @param {Object} ViewImpl The view constructor.
   * @param {Object} options Initialization options.
   * @return {ViewImpl} The created subview.
   */
  initSubView(ViewImpl, options) {
    const view = new ViewImpl(options);

    this._ensureSubViews();
    this._addSubView(view);

    return view;
  },

  /**
   * Attach subview against a given selector, each subview being created by a
   * factory taking the element context as first parameter.
   *
   * The context of the element is:
   * - The element (`el`) itself (the DOM element, not the `jQuery` object).
   * - The index of the element in the set of matched elements.
   *
   * @param {string} selector Node selector.
   * @param {function({el: DOMNode, idx: Number})} factory The factory that will create the view.
   * @return {this} The view (for chaining).
   */
  attachSubViews(selector, factory) {
    const elements = this.$(selector);

    if (elements.length > 0) {
      this._ensureSubViews();

      forEach(elements, (el, idx) => {
        this._addSubView(factory({el, idx}));
      });
    }

    return this;
  },

  /**
   * Get subiew associated to:
   * - A given cid.
   * - Or the stored subview if the parameter is a backbone view.
   *
   * If the stored subview cannot be found, `null` is returned.
   *
   * @param {string|Object} id The view id.
   * @return {Object} The subview, or `null`.
   */
  getSubView(id) {
    if (!this._hasSubViews()) {
      return null;
    }

    const cid = parseCid(id);
    const subview = isNull(cid) ? null : this._subviews.get(cid);
    return subview || null;
  },

  /**
   * Remove subview (or array of subviews).
   * If the function is called without any parameters, all views will be removed.
   *
   * @param {Object} views View, or array of views to remove.
   * @return {this} The view (for chaining).
   */
  removeSubViews(views) {
    if (this._hasSubViews()) {
      if (isNil(views)) {
        this._clearSubViews();
      } else {
        this._removeSubViews(views);
      }
    }

    return this;
  },

  /**
   * Clear all subviews.
   * This method should not be called publicly, please use `removeSubViews` instead.
   *
   * @return {void}
   */
  _clearSubViews() {
    // Remove subviews one by one.
    this._subviews.forEach((view) => {
      this._removeSubView(view);
    });

    // Clear the cache.
    this._subviews.clear();
  },

  /**
   * Remove each view, or array of views.
   * A view may be:
   * - The view instance.
   * - The view cid.
   *
   * @param {string|Object|Array<string|object>} views View, or array of views, to remove.
   * @return {void}
   */
  _removeSubViews(views) {
    const array = castArray(views);

    forEach(array, (view) => {
      const cid = parseCid(view);
      if (this._subviews.has(cid)) {
        this._removeSubView(this._subviews.get(cid));
        this._subviews.delete(cid);
      }
    });
  },

  /**
   * Check if the view has active subviews.
   *
   * @return {boolean} `true` if views has active subviews, `false` otherwise.
   */
  _hasSubViews() {
    // Not that `size` property is a function in old versions of Firefox.
    // Make it safe: handle property or function.
    return !!this._subviews && result(this._subviews, 'size') > 0;
  },

  /**
   * Remove subview.
   *
   * This function should not be called directly, as it does not check if view
   * has previously been added, and it does not remove the view from the subviews
   * cache.
   *
   * Please use `removeSubView` instead.
   *
   * @param {Object} view View to remove.
   * @return {void}
   */
  _removeSubView(view) {
    // Ensure there is no registered listener.
    this.stopListening(view);

    // Remove it, if it was not already removed.
    view.remove();
  },

  /**
   * Add subview.
   * This function should not be called directly, please use `addSubView` instead.
   *
   * @param {Object} view View to remove.
   * @return {void}
   */
  _addSubView(view) {
    // Get the cid.
    const cid = view.cid;

    // Register view.
    this._subviews.set(cid, view);

    // Register some events, if the child view trigger one of these
    // events, the child view will be automatically removed.
    this.listenToOnce(view, 'remove dispose', () => {
      this._removeSubView(view);
      this._subviews.delete(cid);
    });
  },

  /**
   * Ensure the subviews entries has been initialized, and create it
   * otherwise.
   *
   * @return {void}
   */
  _ensureSubViews() {
    if (!this._subviews) {
      this.initializeSubViews();
    }
  },
};
