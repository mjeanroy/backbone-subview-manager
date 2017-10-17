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
import _ from 'underscore';

/**
 * Display framework item.
 * @class
 */
export class FrameworkView extends Backbone.View {
  /**
   * Initialize view.
   * View options must contain the framework item to render.
   *
   * @param {Object} options View options.
   * @return {void}
   * @override
   */
  initialize(options = {}) {
    this.model = options.model;
  }

  /**
   * Render the view.
   * @return {void}
   * @override
   */
  render() {
    const template = Backbone.$('[data-template-id="framework"]').html();
    const templateFn = _.template(template);
    const output = templateFn({
      model: this.model.toJSON(),
    });

     this.$el.html(output);
  }

  /**
   * Return view events.
   * @return {Object} View events.
   * @overrde
   */
  events() {
    return {
      'click a': 'doRemove',
    };
  }

  /**
   * Get view tag name.
   * @return {string} View tag name.
   * @override
   */
  tagName() {
    return 'div';
  }

  /**
   * Get view class name.
   * @return {string} View class name.
   * @override
   */
  className() {
    return 'col-sm-6 col-md-4';
  }

  /**
   * Handle the click event on the remove button.
   * @param {Event} e Click event.
   * @return {void}
   */
  doRemove(e) {
    e.preventDefault();
    this.remove();
  }

  /**
   * Remove view.
   * @return {FrameworkView} The view (for chaining).
   * @override
   */
  remove() {
    super.remove();
    this.trigger('remove');
  }
}
