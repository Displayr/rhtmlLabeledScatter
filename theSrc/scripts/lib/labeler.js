 /* eslint-disable */
import Random from 'random-js'
import _ from 'lodash'
import RBush from 'rbush'
import circleIntersection from '../utils/circleIntersection'

const NO_LOGGING = 0
const MINIMAL_LOGGING = 1
const OUTER_LOOP_LOGGING = 2
const INNER_LOOP_LOGGING = 3
const TRACE_LOGGING = 4

// independent log flags
const OBSERVATION_LOGGING = false
const TEMPERATURE_LOGGING = false
const INITIALISATION_LOGGING = false

const LOG_LEVEL = MINIMAL_LOGGING
// const LOG_LEVEL = OUTER_LOOP_LOGGING

// behaviour controls
const debugForceMaxRounds = null // leave this at NULL unless you want to force the number of sweeps

const LABEL_ITERATION_RANDOM = 'RANDOM'
const LABEL_ITERATION_ENUMERATE = 'ENUMERATE'
const labelIterationTechnique = [LABEL_ITERATION_RANDOM, LABEL_ITERATION_ENUMERATE][0]

const COOLING_PERIOD_PER_SWEEP = 'PER_SWEEP'
const COOLING_PERIOD_PER_MOVE = 'PER_MOVE'
const coolingPeriodTechnique = [COOLING_PERIOD_PER_SWEEP, COOLING_PERIOD_PER_MOVE][0]

const SWEEP_TO_ROUND_MULTIPLIER_ALL_LABELS = 'ALL_LABELS'
const SWEEP_TO_ROUND_MULTIPLIER_DYNAMIC_LABELS = 'DYNAMIC_LABELS'
const SWEEP_TO_ROUND_MULTIPLIER = [SWEEP_TO_ROUND_MULTIPLIER_ALL_LABELS, SWEEP_TO_ROUND_MULTIPLIER_DYNAMIC_LABELS][1]

const POST_SWEEP_ADJUSTMENT_STRATEGY_RANDOM = 'RANDOM'
const POST_SWEEP_ADJUSTMENT_STRATEGY_CARDINAL = 'CARDINAL'
const POST_SWEEP_ADJUSTMENT_STRATEGY = [POST_SWEEP_ADJUSTMENT_STRATEGY_RANDOM, POST_SWEEP_ADJUSTMENT_STRATEGY_CARDINAL][1]

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
  let h1 = 1 // TODO: better variable names. These are the bounds of the view port
  let h2 = 1 // TODO: better variable names. These are the bounds of the view port
  let w1 = 1 // TODO: better variable names. These are the bounds of the view port
  let w2 = 1 // TODO: better variable names. These are the bounds of the view port
  let maxDistance = null
  let plotArea = null
  let worstCaseEnergy = null
  let labeler = {}
  let svg = {}
  let resolveFunc = null
  let pinned = []
  let is_placement_algo_on = true

  const labelTopPadding = 1
  let max_move = 5.0
  let max_angle = 2 * 3.1415
  let skip = 0
  let acc = 0
  let acc_worse = 0
  let rej = 0

  let initialTemperature = null
  let finalTemperature = null

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


  // energy considers:
  //   * distance from label to anchor
  //   * label to label overlap
  //   * label to anchor overlap

  // worst energy possible:
  //   * maxPenalty * Math.hypot(width, height)
  //   * numLabels * labelArea * labelLabelWeight
  //   * numAnchors * labelArea * labelAnchorWeight

  labeler.energy = function ({ label, anchor } = {}) {
    return labeler.detailedEnergy({ label, anchor }).energy
  }

  labeler.detailedEnergy = function ({ label, anchor } = {}) {
    let energyParts = {
      distance: 0,
      distanceType: 'N/A',
      labelOverlap: 0,
      labelOverlapCount: 0,
      labelOverlapList: [],
      anchorOverlap: 0,
      anchorOverlapCount: 0
    }

    // TODO surely I dont have to compute all 8 distances. It should be obvious to determine which is shortest distance ?

    let hdLabelLeftToAnchor = label.minX - 4 - anchor.x
    let hdLabelCenterToAnchor = label.x - anchor.x
    let hdLabelRightToAnchor = label.maxX + 4 - anchor.x
    let vdLabelBottomToAnchor = label.maxY - (anchor.y - 5)
    let vdLabelCenterToAnchor = (label.y - label.height / 2) - anchor.y
    let vdLabelTopToAnchor = label.minY + labelTopPadding - anchor.y

    const centerBottomDistance = Math.hypot(hdLabelCenterToAnchor, vdLabelBottomToAnchor)
    const centerTopDistance = Math.hypot(hdLabelCenterToAnchor, vdLabelTopToAnchor)
    const leftCenterDistance = Math.hypot(hdLabelLeftToAnchor, vdLabelCenterToAnchor)
    const rightCenterDistance = Math.hypot(hdLabelRightToAnchor, vdLabelCenterToAnchor)
    const leftTopDistance = Math.hypot(hdLabelLeftToAnchor, vdLabelTopToAnchor)
    const rightBottomDistance = Math.hypot(hdLabelRightToAnchor, vdLabelBottomToAnchor)
    const rightTopDistance = Math.hypot(hdLabelRightToAnchor, vdLabelTopToAnchor)
    const leftBottomDistance = Math.hypot(hdLabelLeftToAnchor, vdLabelBottomToAnchor)

    // Check if label is inside bubble for centering of label inside bubble
    const labIsInsideBubbleAnc = aIsInsideB(label, anchor)
    if (isBubble && labIsInsideBubbleAnc) {
      vdLabelBottomToAnchor = (label.y - label.height / 4 - anchor.y)
      energyParts.distance = (Math.hypot(hdLabelCenterToAnchor, vdLabelBottomToAnchor) / maxDistance ) * weightLineLength
      energyParts.distanceType = 'labInsideBubble'
    } else {
      // TODO is it better to compute energy offset with the distance, then choose smallest distance and then we have the energy, rather than this switch ?
      const minDist = Math.min(centerBottomDistance, centerTopDistance, leftCenterDistance, rightCenterDistance, leftTopDistance, rightBottomDistance, rightTopDistance, leftBottomDistance)
      switch (minDist) {
        case centerBottomDistance:
          energyParts.distance = (centerBottomDistance / maxDistance) * placementPenaltyMultipliers.centeredAboveAnchor
          energyParts.distanceType = 'centerBottomDistance'
          break
        case centerTopDistance:
          energyParts.distance = (centerTopDistance / maxDistance) * placementPenaltyMultipliers.centeredUnderneathAnchor
          energyParts.distanceType = 'centerTopDistance'
          break
        case leftCenterDistance:
          energyParts.distance = (leftCenterDistance / maxDistance) * placementPenaltyMultipliers.rightOfAnchor // NB left<->right swap is deliberate
          energyParts.distanceType = 'leftCenterDistance'
          break
        case rightCenterDistance:
          energyParts.distance = (rightCenterDistance / maxDistance) * placementPenaltyMultipliers.leftOfAnchor // NB left<->right swap is deliberate
          energyParts.distanceType = 'rightCenterDistance'
          break
        case leftTopDistance:
          energyParts.distance = (leftTopDistance / maxDistance) * placementPenaltyMultipliers.diagonalOfAnchor
          energyParts.distanceType = 'leftTopDistance'
          break
        case rightBottomDistance:
          energyParts.distance = (rightBottomDistance / maxDistance) * placementPenaltyMultipliers.diagonalOfAnchor
          energyParts.distanceType = 'rightBottomDistance'
          break
        case rightTopDistance:
          energyParts.distance = (rightTopDistance / maxDistance) * placementPenaltyMultipliers.diagonalOfAnchor
          energyParts.distanceType = 'rightTopDistance'
          break
        case leftBottomDistance:
          energyParts.distance = (leftBottomDistance / maxDistance) * placementPenaltyMultipliers.diagonalOfAnchor
          energyParts.distanceType = 'leftBottomDistance'
      }
    }

    // TODO: this may need a if numLabels > X then use this ...
    const potentiallyOverlapping = collisionTree.search(label)
    const potentiallyOverlappingLabels = potentiallyOverlapping
      .filter(isLabel)
      .filter(notSameId(label.id))
      // .filter(label => !_.get(label, 'tempIgnore', false))

    const potentiallyOverlappingAnchors = potentiallyOverlapping
      .filter(isAnchor)

    let xOverlap = null
    let yOverlap = null
    let overlapArea = null

    // penalty for label-label overlap
    _.forEach(potentiallyOverlappingLabels, comparisonLab => {
      if (comparisonLab.id !== label.id) {
        xOverlap = Math.max(0, Math.min(comparisonLab.maxX, label.maxX) - Math.max(comparisonLab.minX, label.minX))
        yOverlap = Math.max(0, Math.min(comparisonLab.maxY, label.maxY) - Math.max(comparisonLab.minY, label.minY))
        overlapArea = xOverlap * yOverlap

        if (overlapArea > 0) {
          energyParts.labelOverlap += (overlapArea / label.area * weightLabelToLabelOverlap)
          energyParts.labelOverlapCount++
          energyParts.labelOverlapList.push({ shortText: comparisonLab.shortText, overlapArea, comparisonLab })
          if (LOG_LEVEL >= TRACE_LOGGING) { console.log(`label overlap!`) }
        }
      }
    })
    if (LOG_LEVEL >= INNER_LOOP_LOGGING && energyParts.labelOverlapCount > 0) { console.log(`label overlap percentage: ${(100 * energyParts.labelOverlapCount / lab.length).toFixed(2)}%`) }

    // penalty for label-anchor overlap
    // VIS-291 - this is separate because there could be different number of anc to lab
    _.forEach(potentiallyOverlappingAnchors, anchor => {
      xOverlap = Math.max(0, Math.min(anchor.maxX, label.maxX) - Math.max(anchor.minX, label.minX))
      yOverlap = Math.max(0, Math.min(anchor.maxY, label.maxY) - Math.max(anchor.minY, label.minY))

      overlapArea = xOverlap * yOverlap

      // less penalty if the label is overlapping its own anchor
      if (isBubble && anchor.id === label.id) {
        overlapArea /= 2
      }
      if (overlapArea > 0) {
        energyParts.anchorOverlap += (overlapArea / label.area * weightLabelToAnchorOverlap)
        energyParts.anchorOverlapCount++
        if (LOG_LEVEL >= TRACE_LOGGING) { console.log(`anchor overlap!`) }
      }
    })
    if (LOG_LEVEL >= INNER_LOOP_LOGGING && energyParts.anchorOverlapCount > 0) { console.log(`anchor overlap percentage: ${(100 * energyParts.anchorOverlapCount / anc.length).toFixed(2)}%`) }
    let energy = energyParts.distance + energyParts.labelOverlap + energyParts.anchorOverlap
    return { energy, energyParts }
  }

  labeler.mcmove = function (point) {
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
    // TODO this is done in the mcmove/mcrotate but also in the calling function when not accepting change. Do in one place
    addMinMaxAreaToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)
  }

  labeler.mcrotate = function (point) {
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
    // TODO this is done in the mcmove/mcrotate but also in the calling function when not accepting change. Do in one place
    addMinMaxAreaToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)
  }

  let coolCount = 0
  labeler.cooling_schedule = function ({ currTemperature, initialTemperature, finalTemperature, currentRound, maxRounds }) {
    const newTemperature = initialTemperature - (initialTemperature - finalTemperature) * (currentRound / maxRounds)

    if (TEMPERATURE_LOGGING) { console.log(`coolCount: ${coolCount}. currTemperature: ${currTemperature}. newTemperature: ${newTemperature}`) }
    coolCount++
    return newTemperature
  }
  
  function initLabBoundaries (lab) {
    // TODO duplicated in mcrotate and mcmove
    _.forEach(lab, l => {
      if (l.x + l.width / 2 > w2) l.x = w2 - l.width / 2
      if (l.x - l.width / 2 < w1) l.x = w1 + l.width / 2
      if (l.y > h2) l.y = h2
      if (l.y - l.height < h1) l.y = h1 + l.height
    })
  }
  
  labeler.start = function (maxSweeps) {
    maxDistance = Math.hypot(w2 - w1, h2 - h1)
    plotArea = (w2 - w1) * (h2 - h1)

    const highestDistancePenalty = _(placementPenaltyMultipliers).values().max()
    worstCaseEnergy =
      highestDistancePenalty
      + weightLabelToLabelOverlap * (lab.length - 1)
      + weightLabelToAnchorOverlap * (anc.length - 1)

    initLabBoundaries(lab)
    this.buildDataStructures()
    this.makeInitialObservationsAndAdjustments()

    const pointsWithDynamicLabels = pointsWithLabels.filter(point => {
      const {
        label,
        pinned,
        observations: {
          static: staticObservations
        }
      } = point

      const reasonsToSkip = [
        pinned,
        staticObservations.labelFitsInsideBubble && staticObservations.anchorOverlapProportion < 0.10, // TODO configure
        staticObservations.noInitialCollisionsAndNoNearbyNeighbors
      ]

      return !_.some(reasonsToSkip)
    })

    const activePoints = (SWEEP_TO_ROUND_MULTIPLIER === SWEEP_TO_ROUND_MULTIPLIER_ALL_LABELS)
      ? pointsWithLabels
      : pointsWithDynamicLabels

    // TODO: this is no longer accurate as we still do _some_ stuff before this point
    if (!is_placement_algo_on) {
      // Turn off label placement algo if way too many labels given
      console.log("rhtmlLabeledScatter: Label placement turned off! (too many)")
      return resolveFunc()
    } else {
      labeler.generalSweep({ maxSweeps, activePoints, pointsWithDynamicLabels })
      labeler.postSweep({ activePoints })
      return resolveFunc()
    }
  }

  labeler.generalSweep = function ({ maxSweeps, activePoints, pointsWithDynamicLabels }) {
    const startTime = Date.now()
    let currTemperature = initialTemperature
    const maxRounds = (debugForceMaxRounds || maxSweeps) * activePoints.length
    let currentRound
    for (currentRound = 0; currentRound < maxRounds; currentRound++) {

      const point = (labelIterationTechnique === LABEL_ITERATION_RANDOM)
        ?  activePoints[Math.floor(random.real(0, 1) * activePoints.length)]
        :  activePoints[currentRound % activePoints.length]

      const {
        label,
        pinned,
        observations: {
          static: staticObservations,
          dynamic: dynamicObservations
        }
      } = point


      // TODO: the skip check is not needed when we run with SWEEP_TO_ROUND_MULTIPLIER_DYNAMIC_LABELS
      const reasonsToSkip = [
        pinned,
        staticObservations.labelFitsInsideBubble && staticObservations.anchorOverlapProportion < 0.10, // TODO configure
        staticObservations.noInitialCollisionsAndNoNearbyNeighbors
      ]

      // Ignore if user moved label
      if (_.some(reasonsToSkip)) {
        if (LOG_LEVEL >= OUTER_LOOP_LOGGING) {
          console.log(`${label.shortText}: skipping`)
        }
        skip++
        continue
      }

      const x_old = label.x
      const y_old = label.y

      let old_energy = labeler.energy(point)

      if (random.real(0, 1) < 0.8) {
        labeler.mcmove(point)
      } else {
        labeler.mcrotate(point)
      }

      let new_energy = labeler.energy(point)

      // TODO document final solution once it is ready

      const better = (new_energy < old_energy)
      let acceptChange = null
      if (better) {
        if (LOG_LEVEL >= OUTER_LOOP_LOGGING) { console.log(`${label.shortText}: better: accepting`) }
        acceptChange = true
      } else {
        const oddsPreTemp = 1 - ((new_energy - old_energy) / worstCaseEnergy)
        const odds = oddsPreTemp * currTemperature

        if (oddsPreTemp > 1) {console.error(`got odds pre temp > 1 : ${oddsPreTemp}`)}
        if (oddsPreTemp < 0) {console.error(`got odds pre temp < 0 : ${oddsPreTemp}`)}
        if (currTemperature < 0) {console.error(`got temp < 0 : ${currTemperature}`)}
        if (currTemperature > 1) {console.error(`got temp > 1 : ${currTemperature}`)}
        if (odds > 1) {console.error(`got odds > 1 : ${odds}`)}
        if (odds < 0) {console.error(`got odds < 0 : ${odds}`)}

        acceptChange = random.real(0, 1) < odds

        if (LOG_LEVEL >= OUTER_LOOP_LOGGING) { console.log(`${label.shortText}: worse: old: ${old_energy.toFixed(2)}, new: ${new_energy.toFixed(2)}, temp: ${currTemperature.toFixed(2)}, odds: ${odds.toFixed(5)}, oddsPreTemp: ${oddsPreTemp.toFixed(5)} acceptChange: ${acceptChange}`) }
      }

      dynamicObservations.adjustments.attempts++
      if (acceptChange) {
        acc += 1
        if (new_energy >= old_energy) { acc_worse += 1}
        dynamicObservations.energy.current = new_energy
        dynamicObservations.adjustments.success++
        if (!_.has(dynamicObservations.energy, 'worst') || dynamicObservations.energy.worst < new_energy) { dynamicObservations.energy.worst = new_energy }
        if (!_.has(dynamicObservations.energy, 'best') || dynamicObservations.energy.best > new_energy) { dynamicObservations.energy.best = new_energy }
      } else {
        // move back to old coordinates
        label.x = x_old
        label.y = y_old
        addMinMaxAreaToRectangle(label)
        collisionTree.remove(label)
        collisionTree.insert(label)
        rej += 1
      }

      if (coolingPeriodTechnique === COOLING_PERIOD_PER_MOVE) {
        currTemperature = labeler.cooling_schedule({currTemperature, initialTemperature, finalTemperature, currentRound, maxRounds})
      }
      if (coolingPeriodTechnique === COOLING_PERIOD_PER_SWEEP && currentRound > 0 && currentRound % activePoints.length === 0) {
        const currentSweep = Math.floor(currentRound / activePoints.length)
        currTemperature = labeler.cooling_schedule({
          currTemperature,
          initialTemperature,
          finalTemperature,
          currentRound: currentSweep,
          maxRounds: maxSweeps
        })
      }
    }

    if (LOG_LEVEL >= MINIMAL_LOGGING) {
      console.log(`rhtmlLabeledScatter: Label placement complete after ${currentRound} sweeps. accept/reject/skip: ${acc}/${rej}/${skip} (accept_worse: ${acc_worse})`)
      console.log(JSON.stringify({
        labelCount: lab.length,
        dynamicLabelCount: pointsWithDynamicLabels.length,
        anchorCount: anc.length,
        worstCaseEnergy,
        duration: Date.now() - startTime,
        maxSweeps: debugForceMaxRounds | maxSweeps,
        maxRounds,
        monte_carlo_rounds: acc + rej,
        pass_rate: Math.round((acc / (acc + rej)) * 1000) / 1000,
        accept_worse_rate: Math.round((acc_worse / (acc_worse + rej)) * 1000) / 1000,
        skip,
        acc,
        rej,
        acc_worse
      }))
    }
  }

  labeler.postSweep = function ({ activePoints }) {
    const proportionOfLabelsToAdjust = 0.4

    const currentEnergies = _(activePoints).map(point => `${point.label.shortText}: ${_.get(point, 'observations.dynamic.energy.current', -1).toFixed(2)}`).value()
    console.log('currentEnergies')
    console.log(JSON.stringify(currentEnergies, {}, 2))

    const sortedEnergies = _(activePoints).map('observations.dynamic.energy.current').value().sort((a, b) => a - b)
    // console.log('sortedEnergies')
    // console.log(JSON.stringify(sortedEnergies, {}, 2))

    const boundaryEnergy = sortedEnergies[Math.floor(sortedEnergies.length * (1 - proportionOfLabelsToAdjust ))]
    console.log('boundaryEnergy', boundaryEnergy)

    const worstPoints = activePoints.filter(point => point.observations.dynamic.energy.current >= boundaryEnergy)
    console.log('worstLabels length', worstPoints.length)

    // reset so that they done interfere with each others placement :
    // _(worstPoints).map(point => { point.label.tempIgnore = true })

    _(worstPoints).each(point => {
      if (POST_SWEEP_ADJUSTMENT_STRATEGY === POST_SWEEP_ADJUSTMENT_STRATEGY_RANDOM) {
        labeler.targetedRandomAdjustment({ point })
      } else {
        labeler.targetedCardinalAdjustment({ point })
      }
      // point.label.tempIgnore = false
    })
  }

  labeler.targetedRandomAdjustment = function ({ point }) {
    const {
      label,
      anchor,
      observations: {
        static: staticObservations,
        dynamic: dynamicObservations
      }
    } = point

    // reset label to original position
    // TODO logic taken from PlotData.getPtsAndLabs
    label.x = anchor.x
    label.y = anchor.y - anchor.r - initialLabelVerticalPadding
    addMinMaxAreaToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)

    const energyBefore = dynamicObservations.energy.current

    // TODO address duplication in general sweep
    let currTemperature = 0 // do not accept worse moves during this phase
    let currentRound
    let lastEnergy = null
    for (currentRound = 0; currentRound < 100; currentRound++) {
      const x_old = label.x
      const y_old = label.y

      let old_energy = labeler.energy(point)

      if (random.real(0, 1) < 0.8) {
        labeler.mcmove(point)
      } else {
        labeler.mcrotate(point)
      }

      let new_energy = labeler.energy(point)
      lastEnergy = new_energy

      const better = (new_energy < old_energy)
      let acceptChange = better

      dynamicObservations.adjustments.attempts++
      if (acceptChange) {
        dynamicObservations.energy.current = new_energy
        dynamicObservations.adjustments.success++
        if (!_.has(dynamicObservations.energy, 'worst') || dynamicObservations.energy.worst < new_energy) { dynamicObservations.energy.worst = new_energy }
        if (!_.has(dynamicObservations.energy, 'best') || dynamicObservations.energy.best > new_energy) { dynamicObservations.energy.best = new_energy }
      } else {
        // move back to old coordinates
        label.x = x_old
        label.y = y_old
        addMinMaxAreaToRectangle(label)
        collisionTree.remove(label)
        collisionTree.insert(label)
      }
    }

    console.log(`${anchor.shortText}: done target adjustment. energy before: ${energyBefore} after: ${dynamicObservations.energy.current}`)
  }

  labeler.targetedCardinalAdjustment = function ({ point }) {
    const {
      label,
      anchor,
      observations: {
        static: staticObservations,
        dynamic: dynamicObservations
      }
    } = point

    // // reset label to original position
    // // TODO logic taken from PlotData.getPtsAndLabs
    // label.x = anchor.x
    // label.y = anchor.y - anchor.r - labelTopPadding
    // addMinMaxAreaToRectangle(label)
    // collisionTree.remove(label)
    // collisionTree.insert(label)

    const energyBefore = dynamicObservations.energy.current

    const movesPerDirection = 10
    const widthIncrement = 0.5 * (w2 - w1) / movesPerDirection
    const heightIncrement = 0.5 * (h2 - h1) / movesPerDirection

    const verticalOptions = _.range(label.y - heightIncrement * movesPerDirection, label.y + heightIncrement * movesPerDirection, heightIncrement)
      .map((newHeight, i) => ({ nickname: `vertical_${i}`, x: label.x, y: newHeight }))
    const horizontalOptions = _.range(label.x - widthIncrement * movesPerDirection, label.x + widthIncrement * movesPerDirection, widthIncrement)
      .map((newWidth, i) => ({ nickname: `horizontal_${i}`, x: newWidth, y: label.y }))
    const northEasterlyDiagonal = _.range(verticalOptions.length - 1)
      .map(i => ({ nickname: `NEly_${i}`, x: horizontalOptions[i].x, y: verticalOptions[verticalOptions.length - i - 1].y }))
    const southEasterlyDiagonal = _.range(verticalOptions.length - 1)
      .map(i => ({ nickname: `SEly_${i}`, x: horizontalOptions[i].x, y: verticalOptions[i].y }))

    const options = [
      {  nickname: 'last', x: label.x, y: label.y },
      {  nickname: 'reset', x: anchor.x, y: anchor.y - anchor.r - labelTopPadding }, // TODO logic for reset positioning duplicated from PlotData.getPtsAndLabs
      ...verticalOptions,
      ...horizontalOptions,
      ...northEasterlyDiagonal,
      ...southEasterlyDiagonal
    ]

    // console.log('options')
    // console.log(JSON.stringify(options, {}, 2))

    // const x_old = label.x
    // const y_old = label.y

    // // TODO address duplication in general sweep
    let currTemperature = 0 // do not accept worse moves during this phase
    _(options).each(option => {
      label.x = option.x
      label.y = option.y

      // TODO not necessary in this case becasue we did it above
      // hard wall boundaries // TODO duplicated / can be extracted
      if (label.x + label.width / 2 > w2) { label.x = w2 - label.width / 2 }
      if (label.x - label.width / 2 < w1) { label.x = w1 + label.width / 2 }
      if (label.y > h2) { label.y = h2 }
      if (label.y - label.height < h1) { label.y = h1 + label.height }

      // NB note the hard wall boundaries
      option.x = label.x
      option.y = label.y

      // TODO this is done in the mcmove/mcrotate but also in the calling function when not accepting change. Do in one place
      addMinMaxAreaToRectangle(label)
      collisionTree.remove(label)
      collisionTree.insert(label)

      const { energy, energyParts } = labeler.detailedEnergy(point)
      option.energy = energy
      option.energyParts = energyParts
    })

    console.log(`${label.shortText}: anchor x:${point.anchor.x}, y:${point.anchor.y}`)

    console.log('options')
    console.log(options)

    const bestOption = _(options)
      .sortBy('energy')
      .first()

    console.log('bestOption')
    console.log(JSON.stringify(bestOption, {}, 2))

    label.x = bestOption.x
    label.y = bestOption.y
    addMinMaxAreaToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)

    dynamicObservations.energy.current = bestOption.energy
    dynamicObservations.energy.best = bestOption.energy
    
    console.log(`${anchor.shortText}: done target adjustment. energy before: ${energyBefore} after: ${dynamicObservations.energy.current}`)
  }

  labeler.buildDataStructures = function () {
    _(anc).each(addMinMaxAreaToCircle)
    _(anc).each(a => addTypeToObject(a, 'anchor'))
    _(anc).each(a => { a.shortText = a.label.substr(0, 8).padStart(8) })
    _(lab).each(addMinMaxAreaToRectangle)
    _(lab).each(l => addTypeToObject(l, 'label'))
    _(lab).each(l => { l.shortText = l.text.substr(0, 8).padStart(8) })
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
          anchorOverlapProportion: 0,
          labelFitsInsideBubble: false,
          noInitialCollisionsAndNoNearbyNeighbors: false
        },
        // dynamic observations are updated through the annealing process
        dynamic: {
          adjustments: {
            attempts: 0,
            success: 0
          },
          energy: {}
        },
      }

      const {label, anchor, pinned, id} = point

      // TODO the "if it fits" is an approximation
      // TODO the "move it down by 1/4 of height is a hack (also dont understand why not 1/2)

      //  * don't understand why its not 1/2 of height, not 1/4
      //  * visually it works so leaving it now

      if (label && !pinned) {
        if (isBubble && label.width < 2 * anchor.r) {
          point.observations.static.labelFitsInsideBubble = true
          label.y = anchor.y + label.height / 4
          addMinMaxAreaToRectangle(label)
          collisionTree.remove(label)
          collisionTree.insert(label)
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

      const potentiallyCollidingAnchors = collisionTree.search(anchor)
        .filter(isAnchor)
        .filter(notSameId(id))

      const collidingAnchorsWithOverlap = potentiallyCollidingAnchors
        .map(potentiallyCollidingAnchor => {
          const overlap = circleIntersection(anchor, potentiallyCollidingAnchor)
          return { anchor: potentiallyCollidingAnchor, overlap }
        })
        .filter(({ anchor, overlap }) => overlap > 0)


      if (collidingAnchorsWithOverlap.length > 0) {
        // NB anchorOverlapProportion is inaccurate in that we double count overlap proportion
        point.observations.static.anchorOverlapProportion = _(collidingAnchorsWithOverlap)
          .map('overlap')
          .sum() / anchor.area
      }

      point.observations.static.anchorCollidesWithOtherAnchors = (collidingAnchorsWithOverlap.length > 0)

      if (INITIALISATION_LOGGING) { console.log(`anchor ${anchor.label}(${anchor.id}) potentiallyCollidingAnchorsCount: ${potentiallyCollidingAnchors.length} ollidingAnchorsWithOverlapCount: ${collidingAnchorsWithOverlap.length} anchorOverlapProportion: ${point.observations.static.anchorOverlapProportion}`) }
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
  
  labeler.settings = function (seed, maxMove, maxAngle, isPlacementAlgoOn) {
    // Additional exposed settings
    random = new Random(Random.engines.mt19937().seed(seed))
    max_move = maxMove
    max_angle = maxAngle
    is_placement_algo_on = isPlacementAlgoOn
    return labeler
  }

  labeler.setTemperatureBounds = function (newInitialTemperature, newFinalTemperature) {
    initialTemperature = newInitialTemperature
    finalTemperature = newFinalTemperature
    return labeler
  }

  return labeler
}

module.exports = labeler
/* eslint-enable */

const addMinMaxAreaToCircle = (circle) => {
  circle.minX = circle.x - circle.r
  circle.maxX = circle.x + circle.r
  circle.minY = circle.y - circle.r
  circle.maxY = circle.y + circle.r
  circle.area = Math.PI * Math.pow(circle.r, 2)
  return circle
}

const addMinMaxAreaToRectangle = (rect) => {
  rect.minX = rect.x - rect.width / 2
  rect.maxX = rect.x + rect.width / 2
  rect.minY = rect.y - rect.height
  rect.maxY = rect.y
  rect.area = rect.width * rect.height
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
