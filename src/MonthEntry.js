/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 7/3/12
 * Time: 11:49 AM
 */

define(['EntryBase', 'utils/DateHelper', 'text!MonthEntry.tpl!strip'],
    function (EntryBase, DateHelper, MonthEntryTemplate) {

        var MonthEntry = function MonthEntry(options) {

            if (!options.el) options.el = MonthEntryTemplate;

            EntryBase.call(this, options);

            this.$colorBar = this.$('cj\\:ColorBar');

            this.$titleLabel = this.$('cj\\:Label.month-entry-title');

            this.$startTime = this.$('cj\\:Label.month-entry-start-time');

            this.model.on('change', this._model_changeHandler, this);
        }

        MonthEntry.prototype = Object.create(EntryBase.prototype, {
            render:{
                value:function () {

                    this.$colorBar.css('background-color', this.model.get('Color'));
                    this.$titleLabel.html(this.model.get('Title'));
                    this.$startTime.html(DateHelper.format(this.model.get('StartDateTime'), 'HH:MM TT'));

                    return this;
                }
            },

            _model_changeHandler:{
                value:function () {
                    this.render();
                }
            }
        });
        return MonthEntry;
    });