ProtoWatch
==========

ProtoWatch is a programmable stopwatch webapp developed using the React JavaScript framework.

- React documentation can be found [here](http://facebook.github.io/react/docs/getting-started.html).
- The WebStorm IDE can be downloaded [here](https://www.jetbrains.com/webstorm/).

Deploying for Production/Release
--------------------------

The master source code for ProtoWatch is written with [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html), which is automatically transformed into JavaScript by your browser via `js/JSXTransformer.js`. This is fine for development purposes, but needlessly slow for release. Read more about the [JSX transformation process here](http://facebook.github.io/react/docs/tooling-integration.html#jsx).

**Never** merge the master branch into gh-pages (production), as the master branch uses JSX. Instead, create a temporary middleman branch which has been properly converted to pure JavaScript, and then merge the middleman branch into gh-pages.

 1. Create a new middleman branch.
 2. [Precompile](http://facebook.github.io/react/docs/tooling-integration.html#jsx) any JSX into JavaScript. An [online tool can be found here](http://facebook.github.io/react/jsx-compiler.html).
 3. Modify the pages which refer to JSX code to properly refer to them as JavaScript. For example, in `index.html`, the following:
 
  `<script type="text/jsx" src="js/main.js"></script>`

  should be changed to
	
  `<script src="js/main.js"></script>`

Now, when the middleman branch is merged into gh-pages, gh-pages receives pure JavaScript.
