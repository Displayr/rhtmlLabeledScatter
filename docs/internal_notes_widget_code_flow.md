# Notes taken while doing a walk through of the code

There are internal notes and not refined enough to be very useful for others

## Render Sequence

1. standard htmlwidget -> factory -> renderValue -> then see code

```js
    instance.setConfig(config)
    instance.setUserState(userState)
    return instance.draw()
      # creates RectPlot instance
      # calls RectPlot.draw()
```
    
1. RectPlot constructor

* set date type for X and Y (date, numeric, ordinal)
* determine levels for X and Y
* process settings
* initialise all components:
  * AxisTitle, LegendSettings, Title/Subtitle/Footer, LabelPlacement
* initialise dimensions by calling setDim
  * setDim creates a new ViewBox and a new PlotData
  * this.vb is the ViewBox, and vb.width and vb.height are the plt height and width, after accounting for legend etc
  
  
1. RectPlot.draw()

In a loop based on a Promise chain then/catch model with recursion:

* set snapshot-test class to not ready
* drawDimensionMarkers
  * this throws if the axis renders out of bounds
* drawLegend
  * Q: what causes this to throw
* drawLabsAndPlot
  * calls PlotData.normalizeData
  * calls PlotData.getPtsAndLabs
  * then calls RectPlot.drawLabs which creates SVG elements and adds to plot
  * call placement
  * updates x y of labels
  * Q: what causes this to throw
* drawLegend
  * Q: what causes this to throw
* finally set snapshot-test class to ready 

## File / Class notes

### LabelScatter class: 
  * description of attributes
    * this.data: the data object passed to the widget 
    * this.plot: an instance of RectPlot
  * responsibilities:
    * instantiate RectPlot
    * reset RectPlot when data changes
    * "debounce" resize calls
    
### RectPlot class
  * majority of orchestration performed here


## Refactor Notes

* the positional parameter signature of RectPlot (DONE)
* add default settings and extract out a build config (DONE)
* better comments on what is VIS-390
* need testing on LabelArraySorter (DEPRECATED)

## Where do Image Labels come from

* their class is 'plt-ID-lab-img'
* their data comes from PlotData.getImgLabels
* the widget is downloading them to sample their dimensions for use in the label placement


