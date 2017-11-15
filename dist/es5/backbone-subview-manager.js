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

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('BackboneSubviewManager', ['exports', 'underscore', 'backbone'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('underscore'), require('backbone'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global._, global.Backbone);
    global.BackboneSubviewManager = mod.exports;
  }
})(this, function (exports, _underscore, _backbone) {
  'use strict';

  exports.__esModule = true;
  exports.CompositeView = exports.CompositeViewMixin = undefined;

  var _underscore2 = _interopRequireDefault(_underscore);

  var _backbone2 = _interopRequireDefault(_backbone);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _has = _underscore2['default'].has;
  var _forEach = _underscore2['default'].forEach;
  var keys = _underscore2['default'].keys;
  var result = _underscore2['default'].result;
  var isString = _underscore2['default'].isString;
  var isArray = _underscore2['default'].isArray;
  var isNull = _underscore2['default'].isNull;
  var isUndefined = _underscore2['default'].isUndefined;

  var SUPPORT_ES6_MAP = typeof Map !== 'undefined';

  var Cache = SUPPORT_ES6_MAP ? Map : function () {
    var NIL_OBJECT = {};

    return function () {
      function FallbackMap() {
        _classCallCheck(this, FallbackMap);

        this._o = {};
        this.size = 0;
      }

      FallbackMap.prototype.has = function has(key) {
        return _has(this._o, key) && this._o[key] !== NIL_OBJECT;
      };

      FallbackMap.prototype.get = function get(key) {
        return this.has(key) ? this._o[key] : undefined;
      };

      FallbackMap.prototype.set = function set(key, value) {
        if (!this.has(key)) {
          this.size++;
        }

        this._o[key] = value;
      };

      FallbackMap.prototype.clear = function clear() {
        this._o = {};
        this.size = 0;
      };

      FallbackMap.prototype['delete'] = function _delete(key) {
        if (_has(this._o, key)) {
          this._o[key] = NIL_OBJECT;
          this.size--;
        }
      };

      FallbackMap.prototype.forEach = function forEach(iteratee, ctx) {
        var _this = this;

        if (this.size > 0) {
          _forEach(keys(this._o), function (k) {
            var value = _this._o[k];
            if (value !== NIL_OBJECT) {
              iteratee.call(ctx, _this._o[k], k, _this);
            }
          });
        }
      };

      return FallbackMap;
    }();
  }();

  function isNil(o) {
    return isNull(o) || isUndefined(o);
  }

  function castArray(array) {
    return isArray(array) ? array : [array];
  }

  function parseCid(view) {
    if (isNil(view)) {
      return null;
    }

    if (isString(view)) {
      return view;
    }

    return view.cid || null;
  }

  var CompositeViewMixin = {
    initializeSubViews: function initializeSubViews() {
      this._subviews = new Cache();
      return this;
    },
    addSubViews: function addSubViews(views) {
      var _this2 = this;

      var array = castArray(views);

      if (array.length > 0) {
        this._ensureSubViews();

        _forEach(array, function (view) {
          _this2._addSubView(view);
        });
      }

      return this;
    },
    initSubView: function initSubView(ViewImpl, options) {
      var view = new ViewImpl(options);

      this._ensureSubViews();
      this._addSubView(view);

      return view;
    },
    attachSubViews: function attachSubViews(selector, factory) {
      var _this3 = this;

      var elements = this.$(selector);

      if (elements.length > 0) {
        this._ensureSubViews();

        _forEach(elements, function (el, idx) {
          _this3._addSubView(factory({ el: el, idx: idx }));
        });
      }

      return this;
    },
    getSubView: function getSubView(id) {
      if (!this._hasSubViews()) {
        return null;
      }

      var cid = parseCid(id);
      var subview = isNull(cid) ? null : this._subviews.get(cid);
      return subview || null;
    },
    removeSubViews: function removeSubViews(views) {
      if (this._hasSubViews()) {
        if (isNil(views)) {
          this._clearSubViews();
        } else {
          this._removeSubViews(views);
        }
      }

      return this;
    },
    _clearSubViews: function _clearSubViews() {
      var _this4 = this;

      // Remove subviews one by one.
      this._subviews.forEach(function (view) {
        _this4._removeSubView(view);
      });

      // Clear the cache.
      this._subviews.clear();
    },
    _removeSubViews: function _removeSubViews(views) {
      var _this5 = this;

      var array = castArray(views);

      _forEach(array, function (view) {
        var cid = parseCid(view);
        if (_this5._subviews.has(cid)) {
          _this5._removeSubView(_this5._subviews.get(cid));
          _this5._subviews['delete'](cid);
        }
      });
    },
    _hasSubViews: function _hasSubViews() {
      // Not that `size` property is a function in old versions of Firefox.
      // Make it safe: handle property or function.
      return !!this._subviews && result(this._subviews, 'size') > 0;
    },
    _removeSubView: function _removeSubView(view) {
      // Ensure there is no registered listener.
      this.stopListening(view);

      // Remove it, if it was not already removed.
      view.remove();
    },
    _addSubView: function _addSubView(view) {
      var _this6 = this;

      // Get the cid.
      var cid = view.cid;

      // Register view.
      this._subviews.set(cid, view);

      // Register some events, if the child view trigger one of these
      // events, the child view will be automatically removed.
      this.listenToOnce(view, 'remove dispose', function () {
        _this6._removeSubView(view);
        _this6._subviews['delete'](cid);
      });
    },
    _ensureSubViews: function _ensureSubViews() {
      if (!this._subviews) {
        this.initializeSubViews();
      }
    }
  };

  var CompositeView = _backbone2['default'].View.extend(CompositeViewMixin).extend({
    remove: function remove() {
      this.removeSubViews();
      return _backbone2['default'].View.prototype.remove.call(this);
    }
  });

  exports.CompositeViewMixin = CompositeViewMixin;
  exports.CompositeView = CompositeView;
});