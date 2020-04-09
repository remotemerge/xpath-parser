#!/bin/bash
# generated browser script
browser_script=./dist/browser/index.js

# drop export from file
sed -i -e 's/.*export default.*//' ${browser_script}
# drop last line
sed -i -e '$d' ${browser_script}
