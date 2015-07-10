git branch -f staging
cp -r .\src\* .\build\
rm .\build\js -Recurse
jsx src\js\ build\js\
rm .\build\js\JSXTransformer-0.13.0.js
rm .\build\js\react-with-addons-0.13.0.js
rm .\build\js\.module-cache -Recurse
(Get-Content .\build\index.html) | 
Foreach-Object {$_ -replace 'react-with-addons-0.13.0.js','react-with-addons-0.13.0-production.js'}  | 
Out-File .\build\js\main.js
git commit -a -m "Build commit for $(get-date -format s)"
git checkout master
rm .\build\ -Recurse
git reset --hard