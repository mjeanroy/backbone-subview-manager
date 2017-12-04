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

import _ from 'underscore';
import Backbone from 'backbone';

const has = _.has;
const forEach = _.forEach;
const keys = _.keys;
const result = _.result;
const isString = _.isString;
const isArray = _.isArray;
const isNull = _.isNull;
const isUndefined = _.isUndefined;

/**
 * Flag to check if ES6 Map are supported by the runtime environment (for example,
 * it is not supported without polyfill in IE 8, 9, 10).
 * @type {boolean}
 */
const SUPPORT_ES6_MAP = typeof Map !== 'undefined';

const Cache = SUPPORT_ES6_MAP ? Map : (() => {
  /**
   * A NIL Object that will be used to flag entries that has been previously deleted.
   * As V8 deoptimize entire function using the `delete` operator, this
   * implementation does not use `delete` at all and use this object instance
   * to flag "missing" entry.
   */
  const NIL_OBJECT = {};

  /**
   * Map implementation fallback.
   */
  return class FallbackMap {
    /**
     * Create the cache.
     * @constructor
     */
    constructor() {
      this._o = {};
      this.size = 0;
    }

    /**
     * Check if the given `key` is associated to a value in the
     * cache.
     *
     * @param {string} key The key.
     * @return {boolean} `true` if the entry is in the cache, `false` otherwise.
     */
    has(key) {
      return has(this._o, key) && this._o[key] !== NIL_OBJECT;
    }

    /**
     * Get the value associated to the given key, or `undefined` if the
     * entry is not in the cache.
     *
     * @param {string} key The entry id.
     * @return {*} The value associated to the given key.
     */
    get(key) {
      return this.has(key) ? this._o[key] : undefined;
    }

    /**
     * Put entry in the cache (override the old one if an entry already exist).
     *
     * @param {string} key The entry id.
     * @param {*} value The entry value.
     * @return {void}
     */
    set(key, value) {
      if (!this.has(key)) {
        this.size++;
      }

      this._o[key] = value;
    }

    /**
     * Clear the cache.
     *
     * @return {void}
     */
    clear() {
      this._o = {};
      this.size = 0;
    }

    /**
     * Remove entry in the cache.
     *
     * @param {string} key Entry id.
     * @return {void}
     */
    delete(key) {
      if (has(this._o, key)) {
        this._o[key] = NIL_OBJECT;
        this.size--;
      }
    }

    /**
     * Executes a provided function once per each key/value pair in the Map object.
     *
     * @param {function} iteratee Callback function.
     * @param {*} ctx Callback context.
     * @return {void}
     */
    forEach(iteratee, ctx) {
      if (this.size > 0) {
        forEach(keys(this._o), (k) => {
          const value = this._o[k];
          if (value !== NIL_OBJECT) {
            iteratee.call(ctx, this._o[k], k, this);
          }
        });
      }
    }
  };
})();

/**
 * Check that given object is `null` or `undefined`.
 *
 * @param {*} o The object to test.
 * @return {boolean} `true` if `o` is `null` or `undefined`, `false` otherwise.
 */
function isNil(o) {
  return isNull(o) || isUndefined(o);
}

/**
 * Translate parameter to an array:
 * - If it is an array, it is automatically returned.
 * - Otherwise, an array containing parameter as single element is created and returned.
 *
 * @param {*} array The array, or anything else.
 * @return {Array} The created array.
 */
function castArray(array) {
  return isArray(array) ? array : [array];
}

/**
 * Extract view cid:
 * - If parameter is already a `string`, it is returned.
 * - Otherwise, the `cid` property of `view` is returned.
 *
 * @param {string|Object} view The view containing a cid, or the cid.
 * @return {string} The cid.
 */
function parseCid(view) {
  if (isNil(view)) {
    return null;
  }

  if (isString(view)) {
    return view;
  }

  return view.cid || null;
}

const CompositeViewMixin = {
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
   * Get all subviews as an plain old array.
   *
   * Note that if you want to get a specific subview, it will be more (much more)
   * performant to use `getSubView` instead.
   *
   * Note that the order in the returned array is not guaranteed.
   *
   * @return {Array} Array of subviews.
   */
  getSubViews() {
    const subviews = [];

    if (this._hasSubViews()) {
      this._subviews.forEach((view) => {
        subviews.push(view);
      });
    }

    return subviews;
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

const CompositeView = Backbone.View.extend(CompositeViewMixin).extend({
  /**
   * Remove view, and its subviews.
   *
   * @return {CompositeView} The view (for chaining).
   * @override
   */
  remove() {
    this.removeSubViews();
    return Backbone.View.prototype.remove.call(this);
  },
});

/**
 * Public API.
 */

export { CompositeViewMixin, CompositeView };
