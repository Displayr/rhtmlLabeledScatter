
# HTML Widget Build Environment

## Overview

(At least some of the) HTML Widgets written by Numbers International are maintained as coffeescript based unpublished nodejs projects that use gulp as a task manager. The sole purpose of these npm packages is to produce R HTMLWidget packages, and provide a framework for developing and testing the R pacakge. The rhtmlPictographs repo is one such example.

## Terminology/Technology Breakdown

What does the above really mean ?

**Node project** : Fundamentally all this means is two things:

1. the project contains nodejs code (which is just javascript run on the "server" not in the "browser")
1. there is a package.json file at the project root, and that package.json file defines all of the node.js and browser javascript that is required for the project.

Once a git repo has a package.json, then anyone who pulls that repo contents onto their local machine can download all of the project dependencies simply by running `npm install`. This of course assumes that node and npm are already installed.

**Unpublished NPM package**: We are not publishing our package into the central NPM repository. You cannot, nor would it make any sense to, run `npm install rhtmlPictograph` as no other npm packages would rely on it and it is only used internally by Numbers International to produce R htmlwidgets. The one benefit of registering into the npm servers would be to allow internal use of npm to pull down the code, but we can use git for this. The use of internal unpublished npm packages is pretty common. No one can use our npm package as a dependency; it's only purpose is to produce packages in another language (mind blown) !

**Coffeescript**: Ever written a lot of code in ES5 Javascript? It sucks! The newest versions of Javascript - ES6 aka ES2016 - is significantly better, however is was only recently stanrdardized and is not yet universally supported by modern browsers. Coffeescript provides a lot of syntactic sugar and missing language features that makes JS code looks much cleaner and it easier to read, write, and maintina. In this project all 'production' (i.e., code that is included in the R package) javascript code is written as coffeescript and is 'transpiled' into Javascript. There are alternatives that achieve the same aim: A) write in ES6 and transpile into ES5. B) Write in typescript and transpile into ES5. C) Just write ES5 and be sad.

**Transpile ??** : Compiling is generally understood to be converting a higher level of abstraction into a lower one, for example taking C++ and producing X86 assembly code. Transpiling is converting to/from languages of equal levels of abstraction, for example coffeescript to ES5 javascript, or ES6 javascript to ES5 javascript. This is necessary because modern web browsers still do not have consistent 100% support for ES6 (aka ES2015) javascript. At present, if you want your javascript to work in a good percentage of your customers' browsers, then you need to produce ES5. The problem is that ES5 is missing a LOT of modern language features and makes developers sad.

**HTML Widget Packages**: A R HTML Widget is a special type of R package that contains R code, as well as Javascript. In the case of most HTML Widgets (warning arbitrary stat) 95%  of the code is Javascript and there is very little R code. The majority of our 3rd party dependencies are Javascript packages, so it makes sense to adopt a dependency mnagement system and best practices from the nodejs community (i.e., npm packaging and gulp build tool). However, the end product is still R code. We need a way to use npm to dynamically pull all our dependencies, but still produce a compliant R HTMLWidget package, enter the ....

**Gulp Build System**: Gulp is one of several nodejs based task managers that provide standard ways to define multi step development tasks such as code packaging, code testing, code compiling, and many other common tasks. It's kind of like `make` . Alternatives exist such as grunt and webpack; we are using gulp. Gulp is easiest understood by providing examples, which are provided in the next section.

## Gulp Tasks

`gulp build` : simply by running `gulp build` the following tasks are performed :
 - transpile the coffeescript into ES5 javascript and place in the dist directories
 - compile the LESS into CSS and place in the dist directories
 - copy all images and other resources into the dist directories
 - generate the R docs from the R files and place into the man/ direectory

`gulp serve` : simply by running `gulp serve` the following tasks are performed :
 - all of the build tasks above
 - also produce a different transpiled version of the code that will load in a local browser window
 - in addition to the HTML Widget libraries, the local browser session will include a list of examples. This allows the developer to view how the effect of their most recent changes
 - gulp serve also starts a "watch" process. When used correctly this has a major impact on development velocity. Every save to the local file system will trigger specific gulp tasks, and will also send a signal to the browser to reload the active page.

 ### Why gulp serve ?
 
 Considering the gulp serve description above, consider the following scenario where I begin to add feature X to my widget. I add an example called "feature X WIP" to my scenarios.json file, note that feature X is not implemented yet or is in progress. I run gulp serve, and navigate to the "feature X WIP" example. It doesn't work :(. Thats ok. I make a series of changes, and I have a big monitor/two monitors so I have my browser and my IDE visible at the same time. Every time I save an update to my coffeescript files, gulp auto transpiles them to JS, copies the JS to my browser directory, and sends a reload signal to my browser. I am literally seeing the visual effects of my code changes in real time. This is really good.

## Just in Time Build vs Checked in Build Code

One of the displayr project requirements is that all R packages, including HTML Widgets, must be installable via a single `devtools::install_github` command. This means that all of outputs of the build process must be checked in to git.

In the case of HTML Widgets named FOO the following files are necessary to correctly install via install_github. Before listing them it is *VERY IMPORTANT* to understand *ALL FILES* in the `R/`, `inst/`, and `man/` directories are autogenerated by the `gulp build` task using input from the `theSrc` directory. If you edit these files and then run `gulp build` it will wipe out all your hard work, and your colleagues will laugh at your misfortune !

**R/FOO.R** - the R code that defines the R API for the HTMLWidget

**man/FOO.Rd** - the R code that defines the R API for the HTMLWidget

**inst/htmlwidgets/FOO.js** - the javascript definition of the html widget

**inst/htmlwidgets/FOO.yaml** - a manifest file that defines the javascript and css dependencies of the html 
widget
**inst/htmlwidgets/lib/DEPENDENCY.js** - a JS dependency

**inst/htmlwidgets/lib/STYLE.css** - CSS dependency

## Other Files and Their Roles

**package.json** - this lists all of the npm dependencies. When the project is initially checked out from git, the first thing a developer does is run `npm install`. This reads the package.json file and locally installs all of the specified dependencies into the node_modules directory.

**gulpfile.js** - this defines and implements the build tasks. Any task can be defined and arbitrarily named. In htmlwidget projects the two main tasks are serve and build

**browser/** - this content is autogenerated and is used to test and develop the htmlwidget in a chrome browser context - this is done when running gulp serve.

**inst/** - this is autogenerated and is a required directory where the HTML widget framework will look for all its JS resources

**man** - this is autogenerated and contains R docs

**R** - this is authgenerated and contains the R function signature for the html widget

**resources** - miscallaneous files used in the build process

**resources/build/makeDoc.r** - utility to generate the R docs via roxygen

**resources/data/scenarios.json** - contains examples used in the browser testing to demonstrate functionality

## I'm totally sold! How do I make my htmlwidget use this system ?

Excellent, it would be great if we had a yeoman style project template, but in the absense of that, copy/paste the following files into a new repo and make changes as described:

- package.json - delete the "dependencies" section, add your dependencies, and leave the dev dependencies as is, possibly adding a few new one
- gulpfile.js - you will need to update the `widgetName` at the top of the file, and the extLibs variable to match your JS dependencies
- resources/data/scenarios.json - you'll want to add your own scenarios here
- resources/build/makeDoc.r - no changes needed. This file is needed to generate docs from your R file
- theSrc/render.html - this file is not production it assists the dev process by displaying a scenario in a browser. It should only need it's src tags changed to match the new project, although it may contain some customisations for rhtmlPictographs

Now your actual code needs to go in these locations:

- theSrc/R/htmlwidget.yaml - this is the htmlwidget manifest , list your dependencies in it. `gulp build` will copy it into its location at inst/htmlwidgets
- theSrc/R/htmlwidget.R - this is the R code that defines your htmlwidget API. `gulp build` will copy it into its location at inst/htmlwidgets
- theSrc/scripts/widgetname.coffee - this is where you do the work
- theSrc/styles/main.less - If you use the CSS , put it here and it will get copied into place in inst/htmlwidgets/style/main.css

That should be it. If you follow the instructions below you shouldn't have to dig into and modify the gulpfile, but you are free to structure things how you like, it will just require some modifications to the gulpfile.js.

Happy coding :)
