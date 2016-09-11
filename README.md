# rhtmlLabeledScatter
An HTML widget that creates a labeled scatter plot

# Installation in R

1. `library(devtools)`
1. `install_github('NumbersInternational/rhtmlLabeledScatter')`

Simplest Example to verify installation:

```
coords <- structure(c(-0.242824578883389, 0.447982869795063, 0.471121043396925,
0.464537497309872, -0.0913332694950237, -1.2733742886416, -0.500402183998914,
-0.27373105043976, -1.31538815485031, 0.037206733329165, -0.0787671942486661,
0.488530282325173, -0.29457007350688, -0.235625518884957, 0.601327833549599,
0.287370010414348, -0.923056165508813, 0.453772049498003, -0.25000257344162,
-0.202539757759669, 0.112245635990019, 0.132030273935906, 0.146363526885915,
-0.537816212784355, 0.466468539885024, -0.497665196949348, -0.261639180363143,
0.368144823830639, -0.23730729602076, -0.293995121319046, 0.176112525700419,
-0.419761150156407, -0.0573900558313915, 0.274787466614528, 0.0802524115772252,
0.233157762736366, 0.122368362334109, -0.454640909480694), .Dim = c(19L,
2L), .Dimnames = list(c("Coke", "V", "Red Bull", "Lift Plus",
"Diet.Coke", "Fanta", "Lift", "Pepsi", "Kids", "Teens", "Enjoy life",
"Picks you up", "Refreshes", "Cheers you up", "Energy", "Up-to-date",
"Fun", "When tired", "Relax"), c("Dim1", "Dim2")))


column.labels <- c("Dimension 1 (77.5%)", "Dimension 2 (17%)")

groups <- c("Brand", "Brand", "Brand", "Brand", "Brand", "Brand", "Brand",
"Brand", "Attribute", "Attribute", "Attribute", "Attribute",
"Attribute", "Attribute", "Attribute", "Attribute", "Attribute",
"Attribute", "Attribute")

print(LabeledScatter(X = coords[, 1],
                       Y = coords[, 2],
                       label = rownames(coords),
                       group = groups,
                       fixed.aspect = TRUE,
                       title = "Correspondence analysis",
                       x.title = column.labels[1],
                       y.title = column.labels[2],
                       axis.font.size = 8,
                       labels.font.size = 12,
                       title.font.size = 20,
                       y.title.font.size = 16,
                       x.title.font.size = 16))
```

# Local Installation to Develop/Contribute

**Prerequisites** - For help installing prerequisites see the `Prequisite Installation Help` section below

1. nodejs >= 5.0
1. python 2.7 - one of the nodejs libraries needs python during the installation process

## Installing the rhtmlLabeledScatter code

1. On windows open git shell (or install it first). On OSX open terminal
    1. Tim note : Type enter when prompted for a passphrase when opening git shell
1. Change directory to the place where you put git projects
    1. Tim note : Do not use a Dropbox synced directory. There will be 1000's of files created by `npm install` and your computer will catch fire
1. type `git clone git@github.com:NumbersInternational/rhtmlLabeledScatter.git` ENTER
1. type `cd rhtmlLabeledScatter` ENTER
1. type `npm install` ENTER
    1. `npm install` is noisy and will print several warnings about `UNMET` and `DEPRECATED`. Ignore these and only make note of errors. If it fails, try running it again.
1. type `gulp serve` ENTER
    1. If `gulp serve` does not work try `./node_modules/.bin/gulp serve`. To correct this and to make your nodejs life easier you should add `./node_modules/.bin` to your PATH. Consult the Internet for instructions on how to do so on your OS of choice.

If this worked, then the `gulp serve` command opened your browser and you are looking at `http://localhost:9000`. You should see a page listing a bunch of links to examples, each example shows the simple 4 square widget template. These examples are defined in the [features.json file](theSrc/features/features.json).

Choose an example or add another example to [features.json](theSrc/features/features.json). When changes to any file in `./theSrc` are saved, the browser will automatically reload.

## Prerequisite Installation Help

### Install nodejs on OSX

1. Install brew by following instructions here : http://brew.sh/
1. Install nvm (node version manager) by running `brew install nvm`
1. Install node by running `nvm install 5.8.0` on the terminal

### Install nodejs on Windows

1. Setup nodist. https://github.com/marcelklehr/nodist and find the link to the official installer.
1. Open the command prompt. Type: `nodist v5.8.0`
1. Type `node -v` and verify the version is correct

### Python on OSX - it should come installed. If not

1. Install brew (if not done already) by following instructions here : http://brew.sh/
1. Install python by running `brew install python` on the terminal - make sure you get 2.7

### Python on Windows

1. Download version 2.7 from https://www.python.org/downloads/

# Developing and Contributing

See docs on the [htmlwidget_build_system](docs/htmlwidget_build_system.md) to understand what gulp tasks are available and to understand the role of each file in the project. Here are a few important notes (both detailed in the htmlwidget_build_system docs) you must keep in mind:

1. The last thing you do before committing is run `gulp build` to ensure all the autogenerated files are up to date.
2. (With some exceptions) ONLY EDIT THINGS IN these directories: `theSrc`, and `docs` !! Many of the other files are auto generated based on the contents of `theSrc`. As an example, if you edit `R/rhtmlTemplate.R` and then run `gulp build` your changes will be DELETED FOREVER!, because `R/rhtmlTemplate.R` is just a copy of `theSrc/R/htmlwidget.R`. See [htmlwidget_build_system](docs/htmlwidget_build_system.md) for more details.

# Docs

**Doc manifest**
* [htmlwidget build system](docs/htmlwidget_build_system.md) - gulp task descriptions and file role breakdown
* [extending the template](docs/extending_the_template.md) - instructions on using the template to create a new htmlwidget project
* [how the code works](docs/how_the_code_works.md) - a walkthrough of how the rhtmlTemplate and its successors actually work

## R docs

The [R file](theSrc/R/htmlwidget.R) has inline documentation that is compiled into an [Rd file](man/template.Rd). This documentation can be accessed from R using the following sequence:

```
install_github("NumbersInternational/rhtmlTemplate")
library(rhtmlTemplate)
help(template)
```

## R Examples

There are example widget use in R in the [features.R file](examples/features.R), which is autogenerated based on the features and scenarios defined in the [features.json file](theSrc/features/features.json).

## TODO
- Dragging condensed points bug
- Tooltip coloring
- Integration with displayR and testing
