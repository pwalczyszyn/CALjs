/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/6/12
 * Time: 4:22 PM
 */

define(['EventDispatcher'],
    function (EventDispatcher) {

        var Model = function (properties) {
            EventDispatcher.call(this);
            this.changes = [];
            this.properties = properties ? properties : {};
        };
        Model.prototype = Object.create(EventDispatcher.prototype, {
            set:{
                value:function set(name, value) {
                    this.changes.length = 0;
                    if (typeof name === 'string') {
                        this.properties[name] = value;
                        this.changes.push(name);
                    } else {
                        for (var key in name) {
                            this.properties[key] = name[key];
                            this.changes.push(key);
                        }
                    }
                    this.trigger('change', this);
                }
            },
            get:{
                value:function get(name) {
                    return this.properties[name];
                }
            },
            hasChanged:{
                value:function hasChanged(attribute) {
                    return this.changes.indexOf(attribute) >= 0;
                }
            }

        });

        return Model;
    });