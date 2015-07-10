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

**When is it appropriate to use global variables over state?**

State is generally preferred to be the location of any properties which are used in the process of rendering content to the user.
Global variables are used when it is too complicated to update state for elements individually,
and/or it is impossible to use state to update the context of elements or functions (such as when two functions fire from the same event, as
they will both run in same state context as the event which fired it, regardless of whether or not state is changed before the function runs).

**Why/When is currState/currProps used instead of this.state/this.props?**

When this.state/this.props is being referenced multiple times, we can slightly reduce the scope chain of variable lookups (and improve overall performance) by first
storing this.state/this.props in a local variable. currState/currProps is usually used after the implementation of a function is complete.

Deploying for Production/Release
--------------------------

A PowerShell script is available to build and deploy to gh-pages. Git, NodeJS and JSX must be installed for it to work. 
From the master branch, simply run the script and it will run the necessary steps to deploy to gh-pages.
The general process is creating a temporary branch for staging, converting JSX to Javascript, switching to the production version of React, and committing/pushing the changes to gh-pages.

TODO: write a Unix shell script equivalent.