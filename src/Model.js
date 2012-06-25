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
            this.properties = properties ? properties : {};
        };
        Model.prototype = Object.create(EventDispatcher.prototype, {
            set:{
                value:function set(name, value) {
                    if (typeof name === 'string') {
                        this.properties[name] = value;
                    } else {
                        for (var key in name) {
                            this.properties[key] = name[key];
                        }
                    }
                    this.trigger('change');
                }
            },
            get:{
                value:function get(name) {
                    return this.properties[name];
                }
            }
        });

        return Model;
    });