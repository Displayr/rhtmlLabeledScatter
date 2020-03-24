# Notes taken while doing a walk through of the code

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
  
1. RectPlot.draw()

In a loop based on a Promise chain then/catch model with recursion:

* set snapshot-test class to not ready
* drawDimensionMarkers
  * Q: what causes this to throw
* drawLegend
  * Q: what causes this to throw
* drawLabsAndPlot
  * calls PlotData.normalizeData
  * calls PlotData.getPtsAndLabs which computes placement
  * then calls RectPlot.drawLabs which creates SVG elements and adds to plot
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

## Refactor Notes

* the positional parameter signature of RectPlot
* add default settings and extract out a build config
* better comments on what is VIS-390
* need testing on LabelArraySorter

## Where do Image Labels come from

* their class is 'plt-ID-lab-img'
* their data comes from PlotData.getImgLabels
* the widget is downloading them to sample their dimensions for use in the label placement


