/* eslint-disable */
import Random from 'random-js'
import _ from 'lodash'
import RBush from 'rbush'

const NO_LOGGING = 0
const MINIMAL_LOGGING = 1
const OUTER_LOOP_LOGGING = 2
const INNER_LOOP_LOGGING = 3
const HECTIC_LOGGING = 4

// independent log flags
const OBSERVATION_LOGGING = false
const TEMPERATURE_LOGGING = false
const INITIALISATION_LOGGING = false

const LOG_LEVEL = MINIMAL_LOGGING

const labeler = function () {
    // Use Mersenne Twister seeded random number generator
  let random = new Random(Random.engines.mt19937().seed(1))

  let lab = []
  let anc = []
  // TODO: better name for points (they are not points). Nodes ? Members ?
  let points = [] // combined data structure for efficiency like
  let pointsWithLabels = []
  let collisionTree = null
  let isBubble = false
  let h1 = 1
  let h2 = 1
  let w1 = 1
  let w2 = 1
  let labeler = {}
  let svg = {}
  let resolveFunc = null
  let pinned = []
  let is_non_blocking_on = false
  let is_placement_algo_on = true

  const labelTopPadding = 5
  let max_move = 5.0
  let max_angle = 2 * 3.1415
  let skip = 0
  let acc = 0
  let acc_worse = 0
  let rej = 0
    
  // default weights
  let weightLineLength = 10.0 // leader line length
  let weightLabelToLabelOverlap = 12.0 // label-label overlap
  let weightLabelToAnchorOverlap = 8 // label-anchor overlap
  // 1.0 - NB legacy value for leader line intersection (was never implemented)
  // 2.0 - NB legacy value for leader line-label intersection (was never implemented)

  // penalty for length of leader line
  const placementPenaltyMultipliers = {
    centeredAboveAnchor: weightLineLength * 1,
    centeredUnderneathAnchor: weightLineLength * 1.5,
    leftOfAnchor: weightLineLength * 8,
    rightOfAnchor: weightLineLength * 8,
    diagonalOfAnchor: weightLineLength * 15
  }

  labeler.energy = function ({ label, anchor } = {}) {
    let energy = 0

    // TODO surely I dont have to compute all 8 distances. It should be obvious to determine which is shortest distance ?

    let hdLabelLeftToAnchor = label.minX - 4 - anchor.x
    let hdLabelCenterToAnchor = label.x - anchor.x
    let hdLabelRightToAnchor = label.maxX + 4 - anchor.x
    let vdLabelBottomToAnchor = label.maxY - (anchor.y - 5)
    let vdLabelCenterToAnchor = (label.y - label.height / 2) - anchor.y
    let vdLabelTopToAnchor = label.minY + labelTopPadding - anchor.y

    const centerBottomDistance = hypotenuseDistanceGivenTwoSides(hdLabelCenterToAnchor, vdLabelBottomToAnchor)
    const centerTopDistance = hypotenuseDistanceGivenTwoSides(hdLabelCenterToAnchor, vdLabelTopToAnchor)
    const leftCenterDistance = hypotenuseDistanceGivenTwoSides(hdLabelLeftToAnchor, vdLabelCenterToAnchor)
    const rightCenterDistance = hypotenuseDistanceGivenTwoSides(hdLabelRightToAnchor, vdLabelCenterToAnchor)
    const leftTopDistance = hypotenuseDistanceGivenTwoSides(hdLabelLeftToAnchor, vdLabelTopToAnchor)
    const rightBottomDistance = hypotenuseDistanceGivenTwoSides(hdLabelRightToAnchor, vdLabelBottomToAnchor)
    const rightTopDistance = hypotenuseDistanceGivenTwoSides(hdLabelRightToAnchor, vdLabelTopToAnchor)
    const leftBottomDistance = hypotenuseDistanceGivenTwoSides(hdLabelLeftToAnchor, vdLabelBottomToAnchor)

    // OLD INCORRECT COMPUTATION of labIsInsideBubbleAnc
    // // Check if label is inside bubble for centering of label inside bubble
    // const labIsInsideBubbleAnc = (labelBoundaries.left < anchor.x + anchor.r)
    //   && (labelBoundaries.right > anchor.x - anchor.r)
    //   && (labelBoundaries.top < anchor.y + anchor.r)
    //   && (labelBoundaries.bottom > anchor.y - anchor.r)

    // Check if label is inside bubble for centering of label inside bubble
    const labIsInsideBubbleAnc = aIsInsideB(label, anchor)
    if (isBubble && labIsInsideBubbleAnc) {
      vdLabelBottomToAnchor = (label.y - label.height / 4 - anchor.y)
      energy += hypotenuseDistanceGivenTwoSides(hdLabelCenterToAnchor, vdLabelBottomToAnchor) * weightLineLength
    } else {
      // TODO is it better to compute energy offset with the distance, then choose smallest distance and then we have the energy, rather than this switch ?
      const minDist = Math.min(centerBottomDistance, centerTopDistance, leftCenterDistance, rightCenterDistance, leftTopDistance, rightBottomDistance, rightTopDistance, leftBottomDistance)
      switch (minDist) {
        case centerBottomDistance:
          energy += centerBottomDistance * placementPenaltyMultipliers.centeredAboveAnchor
          break
        case centerTopDistance:
          energy += centerTopDistance * placementPenaltyMultipliers.centeredUnderneathAnchor
          break
        case leftCenterDistance:
          energy += leftCenterDistance * placementPenaltyMultipliers.rightOfAnchor // NB left<->right swap is deliberate
          break
        case rightCenterDistance:
          energy += rightCenterDistance * placementPenaltyMultipliers.leftOfAnchor // NB left<->right swap is deliberate
          break
        case leftTopDistance:
          energy += leftTopDistance * placementPenaltyMultipliers.diagonalOfAnchor
          break
        case rightBottomDistance:
          energy += rightBottomDistance * placementPenaltyMultipliers.diagonalOfAnchor
          break
        case rightTopDistance:
          energy += rightTopDistance * placementPenaltyMultipliers.diagonalOfAnchor
          break
        case leftBottomDistance:
          energy += leftBottomDistance * placementPenaltyMultipliers.diagonalOfAnchor
      }
    }

    // TODO: this may need a if numLabels > X then use this ...
    const potentiallyOverlapping = collisionTree.search(label)
    const potentiallyOverlappingLabels = potentiallyOverlapping
      .filter(isLabel)
      .filter(notSameId(label.id))

    const potentiallyOverlappingAnchors = potentiallyOverlapping
      .filter(isAnchor)

    // const potentiallyOverlappingLabels = lab
    // const potentiallyOverlappingAnchors = anc

    let x_overlap = null
    let y_overlap = null
    let overlap_area = null

    // penalty for label-label overlap
    let labelOverlapCount = 0
    _.forEach(potentiallyOverlappingLabels, comparisonLab => {

      if (comparisonLab.id !== label.id) {
        x_overlap = Math.max(0, Math.min(comparisonLab.maxX, label.maxX) - Math.max(comparisonLab.minX, label.minX))
        y_overlap = Math.max(0, Math.min(comparisonLab.maxY, label.maxY) - Math.max(comparisonLab.minY, label.minY))
        overlap_area = x_overlap * y_overlap

        if (overlap_area > 0) {
          energy += (overlap_area * weightLabelToLabelOverlap)
          labelOverlapCount++
          if (LOG_LEVEL >= HECTIC_LOGGING) { console.log(`label overlap!`) }
        }
      }
    })
    if (LOG_LEVEL >= INNER_LOOP_LOGGING && labelOverlapCount > 0) { console.log(`label overlap percentage: ${(100 * labelOverlapCount / lab.length).toFixed(2)}%`) }

    // penalty for label-anchor overlap
    // VIS-291 - this is separate because there could be different number of anc to lab
    let anchorOverlapCount = 0
    _.forEach(potentiallyOverlappingAnchors, anchor => {
      x_overlap = Math.max(0, Math.min(anchor.maxX, label.maxX) - Math.max(anchor.minX, label.minX))
      y_overlap = Math.max(0, Math.min(anchor.maxY, label.maxY) - Math.max(anchor.minY, label.minY))

      overlap_area = x_overlap * y_overlap

      // TODO: why ?
      if (isBubble && anchor.id === label.id) {
        overlap_area /= 2
      }
      if (overlap_area > 0) {
        energy += (overlap_area * weightLabelToAnchorOverlap)
        anchorOverlapCount++
        if (LOG_LEVEL >= HECTIC_LOGGING) { console.log(`anchor overlap!`) }
      }
    })
    if (LOG_LEVEL >= INNER_LOOP_LOGGING && anchorOverlapCount > 0) { console.log(`anchor overlap percentage: ${(100 * anchorOverlapCount / anc.length).toFixed(2)}%`) }
    return energy
  }

  labeler.mcmove = function (currTemperature, point) {
    // Monte Carlo translation move

    const { label } = point

    // random translation
    label.x += (random.real(0, 1) - 0.5) * max_move
    label.y += (random.real(0, 1) - 0.5) * max_move

    // hard wall boundaries // TODO duplicated / can be extracted
    if (label.x + label.width / 2 > w2) { label.x = w2 - label.width / 2 }
    if (label.x - label.width / 2 < w1) { label.x = w1 + label.width / 2 }
    if (label.y > h2) { label.y = h2 }
    if (label.y - label.height < h1) { label.y = h1 + label.height }
    addMinMaxToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)
  }

  labeler.mcrotate = function (currTemperature, point) {
    // Monte Carlo rotation move

    const { label, anchor } = point

    // random angle
    const angle = (random.real(0, 1) - 0.5) * max_angle

    const s = Math.sin(angle)
    const c = Math.cos(angle)

    // translate label (relative to anchor at origin):
    label.x -= (anchor.x + label.width / 2)
    label.y -= anchor.y

    // rotate label
    let x_new = label.x * c - label.y * s
    let y_new = label.x * s + label.y * c

    // translate label back
    // TODO XXX: feels like this should be
    //    label.x = x_new + (anchor.x + label.width / 2)
    // but when I use that I get regressions.
    // so this works but do not understand why
    label.x = x_new + anchor.x - label.width / 2
    label.y = y_new + anchor.y

    // hard wall boundaries // TODO duplicated / can be extracted
    if (label.x + label.width / 2 > w2) { label.x = w2 - label.width / 2 }
    if (label.x - label.width / 2 < w1) { label.x = w1 + label.width / 2 }
    if (label.y > h2) { label.y = h2 }
    if (label.y - label.height < h1) { label.y = h1 + label.height }
    addMinMaxToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)
  }

  labeler.cooling_schedule = function ({ currTemperature, initialTemperature, finalTemperature, currentSweep, maxSweeps }) {
    const newTemperature = initialTemperature - (initialTemperature - finalTemperature) * (currentSweep / maxSweeps)

    if (TEMPERATURE_LOGGING) { console.log(`currTemperature: ${currTemperature}. newTemperature: ${newTemperature}`) }
    return newTemperature
  }
  
  function initLabBoundaries (lab) {
    _.forEach(lab, l => {
      if (l.x + l.width / 2 > w2) l.x = w2 - l.width / 2
      if (l.x - l.width / 2 < w1) l.x = w1 + l.width / 2
      if (l.y > h2) l.y = h2
      if (l.y - l.height < h1) l.y = h1 + l.height
    })
  }
  
  labeler.start = function (maxSweeps) {
    const startTime = Date.now()

    initLabBoundaries(lab)
    this.buildDataStructures()
    this.makeInitialObservationsAndAdjustments()


    // main simulated annealing function
    let finalTemperature = 1.0
    let initialTemperature = 100.0
    let currTemperature = initialTemperature

    // TODO: this is no longer accurate as we still do _some_ stuff before this point
    if (!is_placement_algo_on) {
      // Turn off label placement algo if way too many labels given
      console.log("rhtmlLabeledScatter: Label placement turned off! (too many)")
      resolveFunc()
      
    } else {
      let currentSweep
      for (currentSweep = 0; currentSweep < maxSweeps; currentSweep++) {
        for (let j = 0; j < pointsWithLabels.length; j++) {
          // select a random label
          const i = Math.floor(random.real(0, 1) * pointsWithLabels.length)
          const point = pointsWithLabels[i]

          // // iterate labels
          // const point = pointsWithLabels[j]

          const {
            label,
            pinned,
            observations: {
              static: staticObservations
            }
          } = point

          const reasonsToSkip = [
            pinned,
            !staticObservations.anchorCollidesWithOtherAnchors && staticObservations.labelFitsInsideBubble,
            staticObservations.noInitialCollisionsAndNoNearbyNeighbors
          ]

          // Ignore if user moved label
          if (_.some(reasonsToSkip)) {
            if (LOG_LEVEL >= OUTER_LOOP_LOGGING) {
              console.log(`${label.text.substr(0, 8).padStart(8)}: skipping`)
            }
            skip++
            continue
          }

          const x_old = label.x
          const y_old = label.y

          let old_energy = labeler.energy(point)

          if (random.real(0, 1) < 0.8) {
            labeler.mcmove(currTemperature, point)
          } else {
            labeler.mcrotate(currTemperature, point)
          }

          let new_energy = labeler.energy(point)

          // the closer this is to 1 the more likely we are to accept (above 1 accept 100%, below 0 accept 0%)
          // the more that new energy is less than old energy, the higher this gets
          // the hotter the temperature (at beginning of sim), higher this value
          const oddsOfAcceptingWorseLayout = Math.exp((old_energy - new_energy) / currTemperature)
          const acceptChange = (new_energy < old_energy) || random.real(0, 1) < oddsOfAcceptingWorseLayout

          if (LOG_LEVEL >= OUTER_LOOP_LOGGING) {
            if (new_energy < old_energy) { console.log(`${label.text.substr(0, 8).padStart(8)}: better: accepting`) }
            else { console.log(`${label.text.substr(0, 8).padStart(8)}: worse: old: ${old_energy.toFixed(2)}, new: ${new_energy.toFixed(2)}, temp: ${currTemperature.toFixed(2)}, odds of accepting: ${oddsOfAcceptingWorseLayout.toFixed(5)} acceptChange: ${acceptChange}`) }
          }

          if (acceptChange) {
            acc += 1
            if (new_energy >= old_energy) { acc_worse += 1}
          } else {
            // move back to old coordinates
            label.x = x_old
            label.y = y_old
            addMinMaxToRectangle(label)
            collisionTree.remove(label)
            collisionTree.insert(label)
            rej += 1
          }
        }
        currTemperature = labeler.cooling_schedule({ currTemperature, initialTemperature, finalTemperature, currentSweep, maxSweeps })
      }

      if (LOG_LEVEL >= MINIMAL_LOGGING) {
        console.log(`rhtmlLabeledScatter: Label placement complete after ${currentSweep} sweeps. accept/reject/skip: ${acc}/${rej}/${skip} (accept_worse: ${acc_worse})`)
        console.log(JSON.stringify({
          labelCount: lab.length,
          anchorCount: anc.length,
          duration: Date.now() - startTime,
          sweep: currentSweep,
          monte_carlo_rounds: acc + rej,
          pass_rate: Math.round((acc / (acc + rej)) * 1000) / 1000,
          accept_worse_rate: Math.round((acc_worse / (acc_worse + rej)) * 1000) / 1000,
          skip,
          acc,
          rej,
          acc_worse
        }))
      }
      resolveFunc()
    }
  }

  labeler.buildDataStructures = function () {
    _(anc).each(addMinMaxToCircle)
    _(anc).each(a => addTypeToObject(a, 'anchor'))
    _(lab).each(addMinMaxToRectangle)
    _(lab).each(l => addTypeToObject(l, 'label'))
    const nestUnderField = (array, type) => array.map(item => ({ id: item.id, [type]: item }))

    const pinnedById = _.transform(pinned, (result, id) => { result[id] = { pinned: true } }, {})
    
    const mergedStructure = _.merge(
      _.keyBy(nestUnderField(lab, 'label'), 'id'),
      _.keyBy(nestUnderField(anc, 'anchor'), 'id'),
      pinnedById
    )
    points = Object.values(mergedStructure)

    collisionTree = new RBush()
    collisionTree.load(anc)
    collisionTree.load(lab)
  }

  labeler.makeInitialObservationsAndAdjustments = function () {
    // note this is a broad sweep collision detection (it is using a rectangle to detect sphere overlap)
    // TODO: test each collision more precisely
    points.forEach(point => {
      point.observations = {
        // static observations are made once at beginning of simulation
        static: {
          anchorCollidesWithOtherAnchors: false,
          labelFitsInsideBubble: false,
          noInitialCollisionsAndNoNearbyNeighbors: false
        },
        // dynamic observations are updated through the annealing process
        dynamic: {
          
        },
      }

      const {label, anchor, pinned, id} = point

      // TODO the "if it fits" is an approximation
      // TODO the "move it down by 1/4 of height is a hack (also dont understand why not 1/2

      //  * don't understand why its not 1/2 of height, not 1/4
      //  * visually it works so leaving it now

      if (label && !pinned) {
        if (isBubble && label.width < 2 * anchor.r) {
          //TODO:  this observation should be on the point not on the anchor
          point.observations.static.labelFitsInsideBubble = true
          label.y = anchor.y + label.height / 4
        }

        const labelAndAnchorBoundingBox = combinedBoundingBox(label, anchor)
        // TODO: make this a percentage of layout, maybe considering layout density ?
        const expandedLabelAndAnchorBoundingBox = expandBox({
          box: labelAndAnchorBoundingBox,
          up: 20,
          down: 20,
          left: 20,
          right: 20
        })

        const nearbyThings = collisionTree.search(expandedLabelAndAnchorBoundingBox)
          .filter(notSameId(id))
        point.observations.static.noInitialCollisionsAndNoNearbyNeighbors = (nearbyThings.length === 0)
      }

      const collidingAnchors = collisionTree.search(anchor)
        .filter(isAnchor)
        .filter(notSameId(id))
      if (INITIALISATION_LOGGING) { console.log(`anchor ${anchor.id} collision count:` , collidingAnchors.length) }
      point.observations.static.anchorCollidesWithOtherAnchors = (collidingAnchors.length > 0)
    })

    if (OBSERVATION_LOGGING) {
      const stats = _.transform(points, (result, { label, anchor, observations }) => {
        if (anchor) { result.anchors++ }
        if (label) { result.labels++ }
        if (observations.static.anchorCollidesWithOtherAnchors) { result.anchorCollidesWithOtherAnchors++ }
        if (observations.static.labelFitsInsideBubble) { result.labelFitsInsideBubble++ }
        if (observations.static.noInitialCollisionsAndNoNearbyNeighbors) { result.noInitialCollisionsAndNoNearbyNeighbors++ }
      }, {
        isBubble,
        anchors: 0,
        labels: 0,
        anchorCollidesWithOtherAnchors: 0,
        labelFitsInsideBubble: 0,
        noInitialCollisionsAndNoNearbyNeighbors: 0
      })
      console.log("observations on data set", stats)
    }

    pointsWithLabels = points.filter(({label}) => label)
  }

  labeler.promise = function (resolve) {
    resolveFunc = resolve
    return labeler
  }

  labeler.svg = function (x) {
    svg = x
    return labeler
  }

  labeler.w1 = function (x) {
    if (!arguments.length) return w
    w1 = x
    return labeler
  }
  labeler.w2 = function (x) {
    if (!arguments.length) return w
    w2 = x
    return labeler
  }

  labeler.h1 = function (x) {
    if (!arguments.length) return h
    h1 = x
    return labeler
  }

  labeler.h2 = function (x) {
    if (!arguments.length) return h
    h2 = x
    return labeler
  }

  labeler.label = function (x) {
    // users insert label positions
    if (!arguments.length) return lab
    lab = x

    return labeler
  }

  labeler.anchor = function (x) {
    // users insert anchor positions
    if (!arguments.length) return anc
    anc = x

    return labeler
  }
  
  labeler.anchorType = function (x) {
    if (!arguments.length) return isBubble
    isBubble = x
    return labeler
  }

  labeler.pinned = function (x) {
    // user positioned labels
    if (!arguments.length) return pinned
    pinned = x
    return labeler
  }
  
  labeler.weights = function (x, y, z) {
    // Weights used in the label placement algorithm
    weightLineLength = x
    weightLabelToLabelOverlap = y
    weightLabelToAnchorOverlap = z
    return labeler
  }
  
  labeler.settings = function (seed, maxMove, maxAngle, isLabelSorterOn, isNonBlockingOn, isPlacementAlgoOn) {
    // Additional exposed settings
    random = new Random(Random.engines.mt19937().seed(seed))
    max_move = maxMove
    max_angle = maxAngle
    is_non_blocking_on = isNonBlockingOn
    is_placement_algo_on = isPlacementAlgoOn
    return labeler
  }

  return labeler
}

module.exports = labeler
/* eslint-enable */

const addMinMaxToCircle = (circle) => {
  circle.minX = circle.x - circle.r
  circle.maxX = circle.x + circle.r
  circle.minY = circle.y - circle.r
  circle.maxY = circle.y + circle.r
  return circle
}

const addMinMaxToRectangle = (rect) => {
  rect.minX = rect.x - rect.width / 2
  rect.maxX = rect.x + rect.width / 2
  rect.minY = rect.y - rect.height
  rect.maxY = rect.y
  return rect
}

const addTypeToObject = (obj, type) => {
  obj.type = type
  return obj
}

const isAnchor = ({ type } = {}) => type === 'anchor'
const isLabel = ({ type } = {}) => type === 'label'
const notSameId = (id) => (obj) => obj.id !== id

const expandBox = ({ box, up = 0, down = 0, left = 0, right = 0 }) => {
  return {
    minX: box.minX - left,
    maxX: box.minX + right,
    minY: box.minY - up,
    maxY: box.maxY + down
  }
}

const combinedBoundingBox = (...boxes) => {
  return _(boxes)
    .filter(x => !_.isNull(x) && !_.isUndefined(x))
    .reduce((minMaxes, box) => ({
      minX: Math.min(minMaxes.minX, box.minX),
      maxX: Math.max(minMaxes.maxX, box.maxX),
      minY: Math.min(minMaxes.minY, box.minY),
      maxY: Math.max(minMaxes.maxY, box.maxY)
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  })
}

const aIsInsideB = (a, b) => {
  return (a.minX >= b.minX) &&
    (a.maxX <= b.maxX) &&
    (a.minY >= b.minY) &&
    (a.maxY <= b.minY)
}

const hypotenuseDistanceGivenTwoSides = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
