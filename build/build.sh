#!/bin/bash

/usr/local/bin/node r.js -o build.js out=../caljs.js
/usr/local/bin/node r.js -o build.js out=../caljs-min.js optimize=uglify
