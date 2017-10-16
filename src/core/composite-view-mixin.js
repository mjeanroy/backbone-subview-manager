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
   * Remove subview.
   *
   * @param {Object} view View to remove.
   * @return {void}
   */
  removeSubView(view) {
    const cid = view.cid;
    if (this._subviews.has(cid)) {
      // Ensure there is no registered listener.
      this.stopListening(view);

      // Remove it, if it was not already removed.
      view.remove();

      // Remove from the subviews entries.
      this._ensureSubViews();
      this._subviews.delete(cid);
    }
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
