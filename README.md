### Backbone Subview-Manager

Minimalist mixin and abstract view implementation to manager subviews in your Backbone application.

#### Installation

- With `npm`: `npm install backbone-subview-manager --save`.
- With `bower`: `bower install backbone-subview-manager --save`.

Once installed, import the library using ES6 import, or import the ES5 script (transpiled with babel):

```html
<script type="text/javascript" src="/vendors/backbone-subview-manager/dist/es5/backbone-subview-manager.js"></script>
```

#### View

Here is an example:

```javascript
import Backbone from 'backbone';
import {CompositeView} from 'backbone-subview-manager';
import {TodoCollection} from './todo.collection';
import {TodoView} from './todo.view';

export class MyView extends CompositeView {
  initialize() {
    this.collection = new TodoCollection();
    this.listenToOnce(this.collection, 'sync', this.render);
    this.collection.fetch();
  }

  tagName() {
    return 'ul';
  }

  render() {
    this.removeSubViews();
    this.addSubViews(this.collection.map((todo) => {
      const todoView = new TodoView({
        model: todo,
      });

      todoView.render();
      this.$el.append(todoView.$el);
      return todoView;
    }));
  }
}
```

**What happens here?**

1. Each element in the collection is rendered in its own view.
2. Once a view is appened, it is automatically registered using the `addSubView` method.
3. When the main is removed, each subviews will be automatically destroyed (using their `remove` method) to avoid memory leaks.

And that's all!

Note that you can also call `initSubView` to create the view automatically. The following code is exactly the same as the previous one:

```javascript
import Backbone from 'backbone';
import {CompositeView} from 'backbone-subview-manager';
import {TodoCollection} from './todo.collection';
import {TodoView} from './todo.view';

export class MyView extends CompositeView {
  initialize() {
    this.collection = new TodoCollection();
    this.listenToOnce(this.collection, 'sync', this.render);
    this.collection.fetch();
  }

  tagName() {
    return 'ul';
  }

  render() {
    this.removeSubViews();
    this.collection.forEach((todo) => {
      const todoView = this.initSubView(TodoView, {
        model: todo,
      }));

      todoView.render();
      this.$el.append(todoView.$el);
    });
  }
}
```

#### API

The following methods can be used on any `CompositeView`:

##### `[this] addSubViews(views)`

Register subview or array of subview that will be automatically removed when the parent view is removed.

##### `[view] initSubView(ViewImpl, options)`

Create the subview (using `options` as constructor parameter), and register it using the `addSubView` method.

##### `[this] removeSubViews(views)`

Remove the subview, or array of subviews (the subview may be the view instance or the view cid).
Calling this function without parameters will remove all subviews.

#### History

This little library has been created in 2013 (still used in production) and open sourced in 2016 after a rewrite in ES6.

#### License

MIT.
