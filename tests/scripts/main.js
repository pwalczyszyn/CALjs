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

require(['jquery', 'Calendar'], function ($, Calendar) {

    var cal = (new Calendar({el:'#container'})).render();
    cal.activate();

});

