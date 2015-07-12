# You will need git and nodejs with jsx installed to run this script
$react_version = '0.13.0'

# Checkout new staging branch
git branch -f staging
git checkout staging
rm .\build\* -Recurse

# Copy files into staging branch
cp -r .\src\* .\build\
rm .\build\js -Recurse
jsx src\js\ build\js\

# Transform JSX -> JS
rm ".\build\js\JSXTransformer-$react_version.js"
rm ".\build\js\react-with-addons-$react_version.js"
rm .\build\js\.module-cache -Recurse

$currentdir = (pwd).path

# Minify files
uglifyjs .\build\js\main.js | Out-File .\build\js\main_temp.js
[System.IO.File]::WriteAllLines($currentdir + '\build\js\main.js', (Get-Content ($currentdir + '\build\js\main_temp.js')))
rm .\build\js\main_temp.js

# Concatenate files


# Rename files
(Get-Content .\build\index.html) | 
Where-Object {$_ -notmatch 'JSXTransformer'} |
Foreach-Object {$_ -replace "react-with-addons-$react_version.js","react-with-addons-$react_version-production.js"}  | 
Foreach-Object {$_ -replace ' type="text/jsx"',''}  | 
Out-File .\build\index_temp.html
[System.IO.File]::WriteAllLines($currentdir + '\build\index.html', (Get-Content ($currentdir + '\build\index_temp.html')))
rm .\build\index_temp.html

# Push changes
git add .
git commit -a -m "Build commit for $(get-date -format s)"
git branch -f gh-pages
git push origin gh-pages -f

# Return to master branch
git checkout master
git branch -D gh-pages
rm .\build\* -Recurse
git reset --hard