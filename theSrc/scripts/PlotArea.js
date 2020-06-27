const _ = require('lodash')
/* * this class owns the labels, anchors, and leader lines
   * this class is responsible for collision detection
   * this class is not responsible for points placed outside the plotArea (i.e. on the legend)
     * but this plot must have an API to add and remove points from the plotArea
   * this class is responsible for drawing the labels, points, and anchors on the plot area
   * Q: IS this class responsible for trend lines ?
   * this class is synchronous, any asynchronity myst be managed by parents
   * Q: IS this class is responsible for converting absolute x/y values to the coordinate system
     * If so then this class must stay synced with the axis
     * A: for now this is an external concern, look at moving it in later

   * Challenges:
     * at present this class will be highly coupled to PLotData and PlotData has a larger role (includes legend interaction)
     * * perhaps this should be a subclass or part of the plotdata class ?

 */

class PlotArea {
  constructor({ parentContainer, width, height, points }) {
    _.assign(this, { parentContainer, width, height, points })
  }

  removePoint(id) {}

  addPoint(point) {}

  draw() {}
}

module.exports = PlotArea