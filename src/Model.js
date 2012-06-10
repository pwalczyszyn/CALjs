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
        Model.prototype = Object.create(EventDispatcher.prototype);

        Model.prototype.set = function set(name, value) {
            this.properties[name] = value;
            this.trigger('change');
        };

        Model.prototype.get = function get(name) {
            return this.properties[name];
        };

        return Model;
    });