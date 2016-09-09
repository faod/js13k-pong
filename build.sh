#!/bin/sh

cat allegrojs/allegro.js > mini.js ; cat colour.js >> mini.js ; cat pong.js >> concat.js
java -jar closure-compiler.jar --compilation_level ADVANCED --js_output_file m.js concat.js
rm concat.js

zip -9 pong.zip index.htm m.js
