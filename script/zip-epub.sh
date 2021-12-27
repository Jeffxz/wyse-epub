zip -X ../$1 mimetype
zip -rg ../$1 ./* -x \*.DS_Store -x mimetype -x wyse.json
