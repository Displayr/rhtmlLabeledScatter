
# How does the template widget work

In addition to being a template for the creation of new html widgets, the rhtmlTemplate widget is a functioning widget meant to demonstrate a few principles. This will be discussed in this document.

The interaction between the R servers, `R_opencpu`, and the `displayr` UI are not covered here.

There are several relevant files:

1. `theSrc/R/htmlwidget.r` : defines the R function signature and does some input formatting before invoking the HTML Widget
1. `theSrc/scripts/rhtmlTemplate.coffee` : registers the `rhtmlWidget` with the HTMLWidget framework. This file is deliberately very light on details and just calls methods on the Template class
1. `theSrc/scripts/Template.coffee` : defines a class that does all of the work creating the htmlwidget.
1. `rHtmlStatefulWidget.coffee` : defines the `RhtmlStatefulWidget` class, which provides an interface for setting and getting state from a html widget. This class is meant to be extended by the main widget class using class inheritance.
1. `rHtmlSvgWidget.coffee` : defines the `RhtmlSvgWidget` class, which provides scaffolding for modifying the outer DOM element and adding a SVG container to the outer DOM. This class is meant to be extended by the main widget class using class inheritance.

## `theSrc/R/htmlwidget.r`

For a simple widget there is not much to be done in the R file. In the `rhtmlTemplate` example the R file parses the JSON string into an object, pulls out the width and height, and calls the `htmlwidgets::createWidget` function to begin the process of rendering the widget. In more complicated widgets, the R file may contain multiple functions that can be used to invoke the htmlwidget in different ways. The R functions can contain parsing logic so that the R functions have simple interfaces that mask the complexity of the underlying widget API from the user.

## `theSrc/R/rhtmlTemplate.coffee`

The format of this file is pretty strict, not much can or should be changed here. I wanted to structure my complex widget code as a class to gain all of the benefits of OO programming. The htmlwidget interface was not ideally suited for this, so the rhtmlTemplate.coffee file provides a bridge between the class structure I have used in `Template.coffee` and `Pictograph.coffee` with the requirements of the `HTMLWidgets.widget` function signature.

This wrapper also handles any errors thrown when interacting the the Template class. If an error is thrown, the error will be rendered to the user using the `DisplayError` class, and the error will be "rethrown" so displayr can handle it.

## `theSrc/scripts/Template.coffee`

As stated, this contains most of the business logic for the widget. There is a lot of flexibility in how each widget is implemented, but if you want to use `rhtmlTemplate.coffee` wrapper, as well as the two parent classes `RhtmlStatefulWidget` and `RhtmlSvgWidget` then your class only needs to implement the following top level functions:

* _processConfig - process the input data before rendering the widget
* _redraw - this performs the initial and subsequnt rendering of the widget.

We now describe the inner workings in detail. Note that you dont need to copy these patterns, but it might make things easier if you do.

When the htmlwidget framework is called from R it begins by calling the `initialize` function in `rthmlTemplate.coffee`. This creates a new instance of the `Template` class. This instance of the `Template` class is what is passed as the `instance` parameter to the `resize` function in `rhtmlTemplate.coffee` and the `renderValue` function in `rhtmlTemplate.coffee`.

The Template constructor does not do much, other than initialize state. In this case state represents which square is selected. We start off with no squares selected. The template constructor also calls super, which invokes the constructor of the parent class(es). So the `RhtmlSvgWidget` constructor is called. The `RhtmlSvgWidget` constructor also calls super, which calls the `RhtmlStatefulWidget` constructor. These parent constructors do some initialization of internal variables.

Next the htmlwidget framework calls the renderValue function defined in rhtmlTemplate.coffee. The renderValue function parses the config and traps errors. next it calls `Template.setConfig` and `Template.draw`.

Template.setConfig is defined in the `RhtmlSvgWidget` parent class and initializes a table-id, then it calls `_processConfig`. **All child class of `RhtmlSvgWidget` (thats you!) must reimplement `_processConfig`**. In processConfig you validate and normalize all of the input config so that the rest of the Widget code can safely assume the format of the config. rhtmlTemplate does not really have any config validation and normalization. Have a look at rhtmlPictographs to see a more concrete example of what setConfig is supposed to do.

Template.draw is just a wrapper that calls three subsequent functions:
* _manipulateRootElementSize: This is defined in the `RhtmlSvgWidget` parent class. This function sets the width and height of the DOM container to 100% so the widget will grow to fit the displayr container. You should not need to modify it.
* _addRootSvgToRootElement: This is defined in the `RhtmlSvgWidget` parent class. This function creates the root SVG element and saves it to this.outerSvg
* _redraw: This is where all the specific logic of the html widget is realized. **All child classes of `RhtmlSvgWidget` must reimplement `_redraw`**.

You are free to throw descriptive errors via the `throw new Error("good description")` pattern. These will be rendered to the user and eventually caught and handled.

If your widget has any state that needs to be persisted, you can extend the `RhtmlStatefulWidget` class. This is detailed below in the RhtmlStatefulWidget section.

If your widget is SVG based, you can extend the `RhtmlSvgWidget` class. This is detailed in the RhtmlSvgWidget section. Note that if you extend RhtmlSvgWidget, then you also get RhtmlStatefulWidget, so you dont need to (in fact you cannot in JS) extend both directly.

## `RhtmlSvgWidget` - from [rhtmlBaseClasses](https://github.com/NumbersInternational/rhtmlBaseClasses)

**Important Note** - the docs below are just a (potentially out of date) mirror of the docs in the [rhtmlBaseClasses](https://github.com/NumbersInternational/rhtmlBaseClasses) repo. You should check the docs in that repo.

This just does some basic formatting of the initial DOM and creates the outerSvg with a viewbox set to the initial width and height. If you extend this class you must define `_redraw` and `_processConfig`, as outlined above.

## `RhtmlStatefulWidget` - from [rhtmlBaseClasses](https://github.com/NumbersInternational/rhtmlBaseClasses)

**Important Note** - the docs below are just a (potentially out of date) mirror of the docs in the [rhtmlBaseClasses](https://github.com/NumbersInternational/rhtmlBaseClasses) repo. You should check the docs in that repo.

If your widget has any state that needs to be persisted, you can extend the `RhtmlStatefulWidget` class. The `RhtmlStatefulWidget` defines an external API that users of your class can call to get and set state. It also defines internal methods that you can call to maintain widget state. Finally it requires that your class implement the function _redraw() to draw and redraw your widget.

Must be implemented by your class:
  _redraw: Put most of the logic for drawing the widget in here.

To be used by your class:
* **_initializeState**: set the initial state without notifying watchers. Typically called from your constructor
* **_updateStateListeners**: - Invoke the callbacks of each of the registered state watchers. You should not need to call this, as it is called automatically when `_putState`, `_updateState`, and `setState` are called. However, it can be called if you need.

To be called externally by users of your class or called internall by child classes:
* **getState**: Get the current state of the widget
* **setState**: Set the current state of the widget. Note that this will notify all state watchers
* **partialStateUpdate**: Partially repalce the widget state, and notify all state watchers
* **registerStateListener**: Provide a callback function that will be executed every time the state updates. The callback will be invoked with the current state provided as the first and only parameter to the callback.

The [render.html](/theSrc/render.html) provides an example of how an external agent would register as a listener, and how to manually setState during load. Have a read through that source if you are considering hooking into widget state.
