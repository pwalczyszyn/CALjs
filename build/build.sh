#!/bin/bash

# This script needs r.js and less installed via npm
# npm install -g less
# npm install -g requirejs

r.js -o build.js out=../caljs.js
r.js -o build.js out=../caljs-min.js optimize=uglify

lessc --include-path="../less" ../less/caljs-light.less > ../caljs-light.css
lessc --include-path="../less" ../less/caljs-dark.less > ../caljs-dark.css
