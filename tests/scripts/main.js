/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:22 PM
 */

//function onBodyLoad() {
//    var cal = new CalJS.Calendar({el:'#container'});
//    cal.render();
//}

require.config({
    baseUrl:'../src',
    paths:{
        jquery:'../tests/scripts/jquery-1.7.2',
        text:'../tests/scripts/text'
    }
});

require(['jquery', 'Calendar', 'Model'], function ($, Calendar, Model) {

    var startDateTime = new Date(),
        endDateTime = new Date();
    endDateTime.setHours(startDateTime.getHours() + 2, 0, 0, 0);

    var entries = [new Model({
        Title:'Test Entry',
        Color:'#ff0000',
        StartDateTime:startDateTime,
        EndDateTime:endDateTime
    })];

    var cal = (new Calendar({el:'#container', collection:entries})).render();
    cal.activate();

});

