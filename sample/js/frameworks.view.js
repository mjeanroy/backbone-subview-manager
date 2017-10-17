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
import {CompositeView} from 'backbone-subview-manager';
import {FrameworksCollection} from './frameworks.collection';
import {FrameworkView} from './framework.view';

/**
 * Display list of frameworks.
 * @class
 */
 /**
  * Display list of frameworks.
  * @class
  */
 export class FrameworksView extends CompositeView {
   /**
    * Initialize callback.
    * @return {void}
    * @override
    */
   initialize() {
     this.collection = new FrameworksCollection();
     this.listenTo(this.collection, 'sync', this.render);
     this.collection.fetch();
   }

   /**
    * Render collection into sub-views.
    * @return {void}
    */
   render() {
     const template = Backbone.$('[data-template-id="frameworks"]').html();
     const templateFn = _.template(template);
     const output = templateFn();
     this.$el.html(output);

     const container = this.$('.js-frameworks');

     this.addSubViews(this.collection.map((model) => {
        const subview = new FrameworkView({
           model,
        });

        subview.render();
        container.append(subview.$el);
        return subview;
     }));
   }
 }
