/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/25/12
 * Time: 3:14 PM
 */

define(['EventDispatcher', 'Model'],
    function (EventDispatcher, Model) {

        var Collection = function (arr) {
            EventDispatcher.call(this);

            this.arr = [];

            if (arr) {
                arr.forEach(function (item) {
                    this._add(item, true);
                }, this);
            }
        };
        Collection.prototype = Object.create(EventDispatcher.prototype, {
            /**
             * Private functions
             */
            _add:{
                value:function (val, silent) {
                    var item = val instanceof Model ? val : new Model(val);
                    item.on('change', this._item_changeHandler, this);

                    this.arr.push(item);
                    if (!silent) this.trigger('add', item);
                }
            },
            _item_changeHandler:{
                value:function (item) {
                    this.trigger('change', item);
                }
            },
            /**
             * Public functions
             */
            forEach:{
                value:function forEach(iterator, thisObject) {
                    this.arr.forEach(iterator, thisObject);
                }
            },
            add:{
                value:function add(models) {
                    if (Array.isArray(models)) {
                        models.forEach(function (item) {
                            this._add(item);
                        }, this);
                    } else {
                        this._add(models);
                    }
                }
            },
            remove:{
                value:function (models) {

                }
            }
        });

        return Collection;

    });