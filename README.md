ProtoWatch
==========

ProtoWatch is a programmable stopwatch webapp developed using the React JavaScript framework.

- React documentation can be found [here](http://facebook.github.io/react/docs/getting-started.html).
- The WebStorm IDE can be downloaded [here](https://www.jetbrains.com/webstorm/).

Navigating the Source Code
--------------------------

ProtoWatch relies primarily on the following files:

 1. *js/main.js* controls everything about ProtoWatch and embeds the ProtoWatch app into *index.html*. Most of the work is done here.
 2. *index.html* modifies the page that holds the ProtoWatch app. Very little is done here.
 After main.js has fully loaded and its initial execution has completed, the contents of the `<div id="container">...</div>` element is replaced with the Main React element.
 3. *css/main.css* makes everything look pretty.

Understanding the Source Code
--------------------------

Before diving in, it is important to understand the distinction between an element's properties (commonly called props) and its state.
An element's properties are passed to it by its parent, and, from the perspective of the element, are considered immutable. Elements dynamically update their own state depending on the circumstances.
An element behaves internally and is rendered based on both its properties and state.

The React documentation goes into further detail on [how props and state apply for elements](https://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html).

**Stopwatch Lifecycle and Functions**

The Stopwatch element houses the main stopwatch display of ProtoWatch. All of its properties are copied from the currently active module,
while its state is managed internally and often modified when buttons are pressed.

**Module Lifecycle and Functions**

Modules house the properties for individual stopwatches, and allow users to modify those properties. Module state and form state is derived from the properties passed by its parent Main;
a module's passed-in properties are considered *currently active data* while a module's state is considered *properties staged for updating*. State data defaults as property data.
When it is time to update a Module's properties from its state, Modules generate new props for themselves and pass them to parent Main through the function handlePropUpdate.

The display value of Module input form fields (with the exception of some real-time updating forms, such as count direction) are binded to unique properties in a module's state.
Modifying the contents of form fields will update state, and in turn, update the form field contents. The form field contents, which are handled by state, do not have to always match exactly what the user inputs
- when state is updated, input may be saved in a modified format (such as without certain characters or trailing whitespaces).

* When an input form field is changed (the onChange event is fired), Module state is changed (see function handleFieldChange), and when the component is re-rendered, the form fields reflect the change.
* Every time Module state is updated, the "Update" and "Revert" buttons (nested in updateButtonWrapper) are revealed or hidden depending on the updated state. If any state field does not match its equivalent property
AND all input fields are valid, the "Update" and "Revert" buttons are revealed. Otherwise, they are hidden.
* When a Module is *updated* via the Update button, the current form input is validated, and then the Module generates new properties for itself which are passed to parent Main through handlePropUpdate.
* For some input fields, additional functionality is implemented for other events. In the timerMax fields, for example, the onBlur event pads the currently displayed value by updating the field's respective state.

**What's with the repeated use of JSON.stringify and JSON.parse?**

Often times when modifying the state or properties of an object in React, it is necessary to quickly clone the object itself to avoid modifying the existing object. Since properties are considered immutable, it is often safer to quickly clone properties and modify those to prevent internal contextual conflicts from occurring.

Deploying for Production/Release
--------------------------

The master source code for ProtoWatch is written with [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html), which is automatically transformed into JavaScript by your browser via *js/JSXTransformer.js*. This is fine for development purposes, but needlessly slow for release. Read more about the [JSX transformation process here](http://facebook.github.io/react/docs/tooling-integration.html#jsx).

**Never** merge the master branch into gh-pages (production), as the master branch uses JSX. Instead, create a temporary middleman branch which has been properly converted to pure JavaScript, and then merge the middleman branch into gh-pages.

 1. Create a new middleman branch.
 2. [Precompile](http://facebook.github.io/react/docs/tooling-integration.html#jsx) any JSX into JavaScript. An [online tool can be found here](http://facebook.github.io/react/jsx-compiler.html).
 3. Modify the pages which refer to JSX code to properly refer to them as JavaScript. For example, in *index.html*, the following:
 
  `<script type="text/jsx" src="js/main.js"></script>`

  should be changed to
	
  `<script src="js/main.js"></script>`

Now, when the middleman branch is merged into gh-pages, gh-pages receives pure JavaScript.

