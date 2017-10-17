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
import {isString, result} from './utils';

export const CompositeViewMixin = {
  /**
   * Initialize subviews entries.
   *
   * @return {void}
   */
  initializeSubViews() {
    this._subviews = new Cache();
  },

  /**
   * Register subview.
   *
   * @param {Object} view The view.
   * @return {void}
   */
  addSubView(view) {
    this._ensureSubViews();
    this._subviews.set(view.cid, view);
  },

  /**
   * Register subview.
   *
   * @param {Object} ViewImpl The view constructor.
   * @param {Object} options Initialization options.
   * @return {ViewImpl} The created subview.
   */
  initSubView(ViewImpl, options = {}) {
    const view = new ViewImpl(options);
    this.addSubView(view);
    return view;
  },

  /**
   * Remove subview.
   *
   * @param {Object} view View to remove.
   * @return {void}
   */
  removeSubView(view) {
    if (this._hasSubViews()) {
      const cid = isString(view) ? view : view.cid;
      if (this._subviews.has(cid)) {
        const subview = this._subviews.get(cid);
        this._removeSubView(subview);
        this._subviews.delete(cid);
      }
    }
  },

  /**
   * Remove all subviews.
   *
   * @return {void}
   */
  removeSubViews() {
    if (this._hasSubViews()) {
      // Remove subviews one by one.
      this._subviews.forEach((view) => {
        this._removeSubView(view);
      });

      // Clear the cache.
      this._subviews.clear();
    }
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
