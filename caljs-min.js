//////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

/**
 * almond 0.1.1 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

/**
 * @license RequireJS text 2.0.0 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */

(function(a,b){typeof define=="function"&&define.amd?define(["jquery"],b):a.CalJS=b(a.jQuery||a.Zepto||a.ender)})(this,function(a){var b,c,d;return function(a){function l(a,b){var c=b&&b.split("/"),d=g.map,e=d&&d["*"]||{},f,h,i,j,k,l,m;if(a&&a.charAt(0)==="."&&b){c=c.slice(0,c.length-1),a=c.concat(a.split("/"));for(k=0;m=a[k];k++)if(m===".")a.splice(k,1),k-=1;else if(m===".."){if(k===1&&(a[2]===".."||a[0]===".."))return!0;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}if((c||e)&&d){f=a.split("/");for(k=f.length;k>0;k-=1){h=f.slice(0,k).join("/");if(c)for(l=c.length;l>0;l-=1){i=d[c.slice(0,l).join("/")];if(i){i=i[h];if(i){j=i;break}}}j=j||e[h];if(j){f.splice(0,k,j),a=f.join("/");break}}}return a}function m(b,c){return function(){return k.apply(a,i.call(arguments,0).concat([b,c]))}}function n(a){return function(b){return l(b,a)}}function o(a){return function(b){e[a]=b}}function p(b){if(f.hasOwnProperty(b)){var c=f[b];delete f[b],h[b]=!0,j.apply(a,c)}if(!e.hasOwnProperty(b))throw new Error("No "+b);return e[b]}function q(a,b){var c,d,e=a.indexOf("!");return e!==-1?(c=l(a.slice(0,e),b),a=a.slice(e+1),d=p(c),d&&d.normalize?a=d.normalize(a,n(b)):a=l(a,b)):a=l(a,b),{f:c?c+"!"+a:a,n:a,p:d}}function r(a){return function(){return g&&g.config&&g.config[a]||{}}}var e={},f={},g={},h={},i=[].slice,j,k;j=function(b,c,d,g){var i=[],j,k,l,n,s,t;g=g||b;if(typeof d=="function"){c=!c.length&&d.length?["require","exports","module"]:c;for(t=0;t<c.length;t++){s=q(c[t],g),l=s.f;if(l==="require")i[t]=m(b);else if(l==="exports")i[t]=e[b]={},j=!0;else if(l==="module")k=i[t]={id:b,uri:"",exports:e[b],config:r(b)};else if(e.hasOwnProperty(l)||f.hasOwnProperty(l))i[t]=p(l);else if(s.p)s.p.load(s.n,m(g,!0),o(l),{}),i[t]=e[l];else if(!h[l])throw new Error(b+" missing "+l)}n=d.apply(e[b],i);if(b)if(k&&k.exports!==a&&k.exports!==e[b])e[b]=k.exports;else if(n!==a||!j)e[b]=n}else b&&(e[b]=d)},b=c=k=function(b,c,d,e){return typeof b=="string"?p(q(b,c).f):(b.splice||(g=b,c.splice?(b=c,c=d,d=null):b=a),c=c||function(){},e?j(a,b,c,d):setTimeout(function(){j(a,b,c,d)},15),k)},k.config=function(a){return g=a,k},d=function(a,b,c){b.splice||(c=b,b=[]),f[a]=[a,b,c]},d.amd={jQuery:!0}}(),d("almond",function(){}),d("Component",[],function(){var b=function(a){this.isTouch="ontouchstart"in window,this.MOUSE_DOWN_EV=this.isTouch?"touchstart":"mousedown",this.MOUSE_MOVE_EV=this.isTouch?"touchmove":"mousemove",this.MOUSE_UP_EV=this.isTouch?"touchend":"mouseup",this.options=a,this.options&&(this.options.el&&this.setElement(this.options.el),this.options.model&&this.setModel(this.options.model))};return b.prototype.setElement=function(b){b||(b="<div/>"),this.$el=a(b),this.el=this.$el[0]},b.prototype.$=function(a){return this.$el.find(a)},b.prototype.setModel=function(a){this.model=a},b.prototype.render=function(){return this},b}),d("text",["module"],function(a){var b=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],d=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,e=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,f=typeof location!="undefined"&&location.href,g=f&&location.protocol&&location.protocol.replace(/\:/,""),h=f&&location.hostname,i=f&&(location.port||undefined),j=[],k=a.config(),l,m;return l={version:"2.0.0",strip:function(a){if(a){a=a.replace(d,"");var b=a.match(e);b&&(a=b[1])}else a="";return a},jsEscape:function(a){return a.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")},createXhr:function(){var a,c,d;if(typeof XMLHttpRequest!="undefined")return new XMLHttpRequest;if(typeof ActiveXObject!="undefined")for(c=0;c<3;c++){d=b[c];try{a=new ActiveXObject(d)}catch(e){}if(a){b=[d];break}}return a},parseName:function(a){var b=!1,c=a.indexOf("."),d=a.substring(0,c),e=a.substring(c+1,a.length);return c=e.indexOf("!"),c!==-1&&(b=e.substring(c+1,e.length),b=b==="strip",e=e.substring(0,c)),{moduleName:d,ext:e,strip:b}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(a,b,c,d){var e=l.xdRegExp.exec(a),f,g,h;return e?(f=e[2],g=e[3],g=g.split(":"),h=g[1],g=g[0],(!f||f===b)&&(!g||g===c)&&(!h&&!g||h===d)):!0},finishLoad:function(a,b,c,d){c=b?l.strip(c):c,k.isBuild&&(j[a]=c),d(c)},load:function(a,b,c,d){if(d.isBuild&&!d.inlineText){c();return}k.isBuild=d.isBuild;var e=l.parseName(a),j=e.moduleName+"."+e.ext,m=b.toUrl(j),n=k.useXhr||l.useXhr;!f||n(m,g,h,i)?l.get(m,function(b){l.finishLoad(a,e.strip,b,c)},function(a){c.error&&c.error(a)}):b([j],function(a){l.finishLoad(e.moduleName+"."+e.ext,e.strip,a,c)})},write:function(a,b,c,d){if(j.hasOwnProperty(b)){var e=l.jsEscape(j[b]);c.asModule(a+"!"+b,"define(function () { return '"+e+"';});\n")}},writeFile:function(a,b,c,d,e){var f=l.parseName(b),g=f.moduleName+"."+f.ext,h=c.toUrl(f.moduleName+"."+f.ext)+".js";l.load(g,c,function(b){var c=function(a){return d(h,a)};c.asModule=function(a,b){return d.asModule(a,h,b)},l.write(a,g,c,e)},e)}},typeof process!="undefined"&&process.versions&&!!process.versions.node?(m=c.nodeRequire("fs"),l.get=function(a,b){var c=m.readFileSync(a,"utf8");c.indexOf("﻿")===0&&(c=c.substring(1)),b(c)}):l.createXhr()?l.get=function(a,b,c){var d=l.createXhr();d.open("GET",a,!0),k.onXhr&&k.onXhr(d,a),d.onreadystatechange=function(e){var f,g;d.readyState===4&&(f=d.status,f>399&&f<600?(g=new Error(a+" HTTP status: "+f),g.xhr=d,c(g)):b(d.responseText))},d.send(null)}:typeof Packages!="undefined"&&(l.get=function(a,b){var c="utf-8",d=new java.io.File(a),e=java.lang.System.getProperty("line.separator"),f=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(d),c)),g,h,i="";try{g=new java.lang.StringBuffer,h=f.readLine(),h&&h.length()&&h.charAt(0)===65279&&(h=h.substring(1)),g.append(h);while((h=f.readLine())!==null)g.append(e),g.append(h);i=String(g.toString())}finally{f.close()}b(i)}),l}),d("text!WeekView.tpl!strip",[],function(){return"<cj:WeekView>\n\n</cj:WeekView>\n\n"}),d("WeekView",["Component","text!WeekView.tpl!strip"],function(a,b){var c=function(c){c.el=b,a.call(this,c)};return c.prototype=Object.create(a.prototype),c.prototype.render=function(){return this},c}),d("MonthView",["Component"],function(a){var b=function(b){a.call(this,b)};return b.prototype=Object.create(a.prototype),b.prototype.render=function(){return this},b}),d("text!Calendar.tpl!strip",[],function(){return'<cj:Calendar xmlns:cj="http://caljs.org/1.0">\n    <cj:NavigationBar>\n\n        <cj:NavigationBarLeft>\n            <cj:Button class="btn-prev"/>\n        </cj:NavigationBarLeft>\n\n        <cj:NavigationBarRight>\n\n        </cj:NavigationBarRight>\n    </cj:NavigationBar>\n</cj:Calendar>'}),d("Calendar",["Component","WeekView","MonthView","text!Calendar.tpl!strip"],function(b,c,d,e){var f=function(d){function f(a){alert("mouse down handle")}d||(d={el:"<div/>"}),b.call(this,d),this.weekView=new c({model:this.model,date:this.date}),this.weekView.$el.on(this.MOUSE_DOWN_EV,{context:this},f),this.monthView=null,this.currentView=this.weekView,this.date=d&&d.date?d.date:new Date,function(b){b.$el.on("click jc\\:Button",function(a){alert("Button clicked")})}(this),this.render=function(){return this.$calendar=a(e),this.$calendar.append(this.currentView.el),this.currentView.render(),this.$el.html(this.$calendar),this}};return f.prototype=Object.create(b.prototype),f}),{Calendar:c("Calendar")}})