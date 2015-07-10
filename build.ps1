# You will need git and nodejs with jsx installed to run this script
$react_version = '0.13.0'

git branch -f staging
git checkout staging
rm .\build\* -Recurse
cp -r .\src\* .\build\
rm .\build\js -Recurse
jsx src\js\ build\js\
rm ('.\build\js\JSXTransformer-' + $react_version + '.js')
rm ('.\build\js\react-with-addons-' + $react_version + '.js')
rm .\build\js\.module-cache -Recurse
(Get-Content .\build\index.html) | 
Where-Object {$_ -notmatch 'JSXTransformer'} |
Foreach-Object {$_ -replace 'react-with-addons-' + $react_version + '.js','react-with-addons-' + $react_version + '-production.js'}  | 
Foreach-Object {$_ -replace ' type="text/jsx"',''}  | 
Out-File .\build\index_temp.html
$currentdir = (pwd).path
[System.IO.File]::WriteAllLines($currentdir + '\build\index.html', (Get-Content ($currentdir + '\build\index_temp.html')))
rm .\build\index_temp.html
git add .
git commit -a -m "Build commit for $(get-date -format s)"
git checkout master
rm .\build\* -Recurse
git reset --hard