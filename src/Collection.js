/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/25/12
 * Time: 3:14 PM
 */

define(['EventDispatcher'],
    function (EventDispatcher) {

        var Collection = function (arr) {
            EventDispatcher.call(this);
            this.arr = arr ? arr : [];
        };
        Collection.prototype = Object.create(EventDispatcher.prototype, {
            forEach:{
                value:function forEach(iterator, thisObject) {
                    this.arr.forEach(iterator, thisObject);
                }
            },
            add:{
                value:function add(models) {
//                    Array.isArray()
                }
            }
        });

        return Collection;

    });