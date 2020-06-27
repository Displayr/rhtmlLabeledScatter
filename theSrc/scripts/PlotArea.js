import _ from 'lodash'
import RBush from 'rbush'

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
  constructor() {

  }

  init ({ parentContainer, width, height, top, left, points }) {
    _.assign(this, { parentContainer, width, height, top, left, points })
    this.right = this.left + this.width
    this.bottom = this.top + this.height

    const anchors = points.map(({ anchor }) => anchor)
    const labels = points.filter(({ label }) => label).map(({ label }) => label)

    _.forEach(labels, label => {
      this.enforceBoundaries(label)
      addMinMaxAreaToRectangle(label)
    })

    this.collisionTree = new RBush()
    this.collisionTree.load(anchors)
    this.collisionTree.load(labels)
  }

  reset () {
    _.assign(this, {
      collisionTree: null,
      parentContainer: null,
      top: null,
      left: null,
      bottom: null,
      right: null,
      width: null,
      height: null,
      points: null
    })
  }

  getPoints () {
    return this.points
  }

  getAnchors () {
    return this.points.map(({ anchor }) => anchor)
  }

  getLabels () {
    return this.points.filter(({ label }) => label).map(({ label }) => label)
  }

  moveLabel ({ label, x, y }) {
    // TODO : abort if x==x and y==y

    // NB the remove fn considers the bbox so you must remove label before altering the coordinates
    this.collisionTree.remove(label)

    label.x = x
    label.y = y
    this.enforceBoundaries(label)
    addMinMaxAreaToRectangle(label)
    this.collisionTree.insert(label)

    // enforceBoundaries modified label.x and label.y so final x,y may not equal the requested x,y
    return { x: label.x, y: label.y }
  }

  enforceBoundaries (label) {
    if (label.x + label.width / 2 > this.right) { label.x = this.right - label.width / 2 }
    if (label.x - label.width / 2 < this.left) { label.x = this.left + label.width / 2 }
    if (label.y > this.bottom) { label.y = this.bottom }
    if (label.y - label.height < this.top) { label.y = this.top + label.height }
  }

  findCollisions(rectangle) {
    return this.collisionTree.search(rectangle)
  }

  removePoint(id) {}

  addPoint(point) {}
}

module.exports = PlotArea


// TODO extract addMinMaxAreaToCircle and addMinMaxAreaToRectangle to util. Currently duplicated in labeler, plotdata, and plotArea

const addMinMaxAreaToRectangle = (rect) => {
  rect.minX = rect.x - rect.width / 2
  rect.maxX = rect.x + rect.width / 2
  rect.minY = rect.y - rect.height
  rect.maxY = rect.y
  rect.area = rect.width * rect.height
  return rect
}
