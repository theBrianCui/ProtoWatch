git branch -f staging
git checkout staging
rm .\build\* -Recurse
cp -r .\src\* .\build\
rm .\build\js -Recurse
jsx src\js\ build\js\
rm .\build\js\JSXTransformer-0.13.0.js
rm .\build\js\react-with-addons-0.13.0.js
rm .\build\js\.module-cache -Recurse
(Get-Content .\build\index.html) | 
Where-Object {$_ -notmatch 'JSXTransformer'} |
Foreach-Object {$_ -replace 'react-with-addons-0.13.0.js','react-with-addons-0.13.0-production.js'}  | 
Foreach-Object {$_ -replace ' type="text/jsx"',''}  | 
set-variable output $_
Out-File $output
git add .
git commit -a -m "Build commit for $(get-date -format s)"
git checkout master
rm .\build\* -Recurse
git reset --hard