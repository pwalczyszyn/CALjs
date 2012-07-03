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

            options.el = MonthEntryTemplate;

            EntryBase.call(this, options);

            this.$colorBar = this.$('cj\\:ColorBar');

            this.$titleLabel = this.$('cj\\:Label.month-entry-title');

            this.$startTime = this.$('cj\\:Label.month-entry-start-time');

            // Entry render function
            this.renderFn = options.monthEntryRenderFn || this._defaultRender;

            // Model change rerender function
            this.changeFn = options.monthEntryChangeFn || this._defaultRender;

            this.model.on('change', this._model_changeHandler, this);
        }

        MonthEntry.prototype = Object.create(EntryBase.prototype, {
            render:{
                value:function render() {
                    return this.renderFn.call(this);
                }
            },

            _defaultRender:{
                value:function _defaultRender() {
                    this.$colorBar.css('background-color', this.model.get('Color'));
                    this.$titleLabel.html(this.model.get('Title'));
                    this.$startTime.html(DateHelper.format(this.model.get('StartDateTime'), 'HH:MM TT'));
                    return this;
                }
            },

            _model_changeHandler:{
                value:function _model_changeHandler() {
                    this.changeFn.call(this);
                }
            }
        });
        return MonthEntry;
    });