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
const POST_SWEEP_OPTION_LOGGING = false

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

  const labelTopPadding = 3 // TODO needs to be configurable, and is duplicated !
  let max_move = 5.0
  let max_angle = 2 * 3.1415

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
    besideAnchor: weightLineLength * 8,
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
      anchorOverlapCount: 0,
      anchorOverlapList: [],
    }

    // Check if label is inside bubble for centering of label inside bubble
    const labIsInsideBubbleAnc = aIsInsideB(label, anchor)
    if (isBubble && labIsInsideBubbleAnc) {
      energyParts.distance = 0
      energyParts.distanceType = 'labInsideBubble'
      label.leaderLineType = 'labInsideBubble'
    } else {
      const bestLeaderLineOption = labeler.chooseBestLeaderLine(label, anchor)
      energyParts.distance = (bestLeaderLineOption.distance / maxDistance) * bestLeaderLineOption.energyMultiplier
      energyParts.distanceType = bestLeaderLineOption.name
      label.leaderLineType = bestLeaderLineOption.name
    }

    // TODO: this may need a if numLabels > X then use this ...
    const potentiallyOverlapping = collisionTree.search(label)
    const potentiallyOverlappingLabels = potentiallyOverlapping
      .filter(isLabel)
      .filter(notSameId(label.id))

    const potentiallyOverlappingAnchors = potentiallyOverlapping
      .filter(isAnchor)

    let xOverlap = null
    let yOverlap = null
    let overlapArea = null

    // penalty for label-label overlap
    _.forEach(potentiallyOverlappingLabels, comparisonLab => {
      if (comparisonLab.id !== label.id) { // TODO this if appears unecessary given filter above notSameId
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

        // console.log(`label '${label.shortText}' and anchor '${anchor.shortText}' overlap ${overlapArea}`)
        // console.log(`anchor X ${anchor.minX} - ${anchor.maxX}, anchor Y ${anchor.minY} - ${anchor.maxY} anchor R: ${anchor.r}`)
        // console.log(`label X ${label.minX} - ${label.maxX}, label Y ${label.minY} - ${label.maxY}, height: ${label.height}`)

        energyParts.anchorOverlap += (overlapArea / label.area * weightLabelToAnchorOverlap)
        energyParts.anchorOverlapCount++
        energyParts.anchorOverlapList.push({ shortText: anchor.shortText, overlapArea, anchor })
        if (LOG_LEVEL >= TRACE_LOGGING) { console.log(`anchor overlap!`) }
      }
    })
    if (LOG_LEVEL >= INNER_LOOP_LOGGING && energyParts.anchorOverlapCount > 0) { console.log(`anchor overlap percentage: ${(100 * energyParts.anchorOverlapCount / anc.length).toFixed(2)}%`) }
    let energy = energyParts.distance + energyParts.labelOverlap + energyParts.anchorOverlap
    return { energy, energyParts }
  }

  // NB TODO there are some fundamental issues with how we assign a energy weight to represent the leader line length and relative position
  //  * the logic to actually decide which line to use is in Links.js
  //  * we do not optimally weight the default position of the label (labelTopPadding px above the anchor
  //  * in some cases we do not account for the radius of the anchor
  //  * this fn could pick a "best line" and use that for the energy, but the Links.js will actually draw a different line
  //
  // I have not addressed this because of time, and because initial attempts to start to address this actually made
  // labelling worse, so more investigation is needed
  labeler.chooseBestLeaderLine = function (label, anchor) {
    // negatives are fine here, as they are only used for Math.hypot, and we discard anything not enabled
    let hdLabelLeftToAnchor = label.minX - anchor.maxX
    let hdLabelRightToAnchor = label.maxX - anchor.minX
    let hdLabelCenterToAnchor = (label.maxX - label.width / 2) - anchor.x // TODO does not take into account label radius

    let vdLabelCenterToAnchor = (label.maxY - label.height / 2) - anchor.y // TODO does not take into account label radius

    // new implemenation : what I think is correct. Results in perf deterioration : see both_mirror in regression set example
    // let vdLabelTopToAnchor = label.minY - labelTopPadding - anchor.maxY
    // let vdLabelBottomToAnchor = label.maxY + labelTopPadding - anchor.minY

    // old implemenation : is arbitrary and doesn't factor anchor size or variable padding : works better than the "correct impl does"
    let vdLabelTopToAnchor = label.minY + 1 - anchor.maxY
    let vdLabelBottomToAnchor = label.maxY - (anchor.y - 5)
    
    const leaderLinePositionOptions = [
      {
        name: 'centerBottomDistance',
        distance: Math.hypot(hdLabelCenterToAnchor, vdLabelBottomToAnchor),
        energyMultiplier: placementPenaltyMultipliers.centeredAboveAnchor,
      },
      {
        name: 'centerTopDistance',
        distance: Math.hypot(hdLabelCenterToAnchor, vdLabelTopToAnchor),
        energyMultiplier: placementPenaltyMultipliers.centeredUnderneathAnchor,
      },
      {
        name: 'leftCenterDistance',
        distance: Math.hypot(hdLabelLeftToAnchor, vdLabelCenterToAnchor),
        energyMultiplier: placementPenaltyMultipliers.besideAnchor,
      },
      {
        name: 'rightCenterDistance',
        distance: Math.hypot(hdLabelRightToAnchor, vdLabelCenterToAnchor),
        energyMultiplier: placementPenaltyMultipliers.besideAnchor,
      },
      {
        name: 'leftTopDistance',
        distance: Math.hypot(hdLabelLeftToAnchor, vdLabelTopToAnchor),
        energyMultiplier: placementPenaltyMultipliers.diagonalOfAnchor,
      },
      {
        name: 'rightBottomDistance',
        distance: Math.hypot(hdLabelRightToAnchor, vdLabelBottomToAnchor),
        energyMultiplier: placementPenaltyMultipliers.diagonalOfAnchor,
      },
      {
        name: 'rightTopDistance',
        distance: Math.hypot(hdLabelRightToAnchor, vdLabelTopToAnchor),
        energyMultiplier: placementPenaltyMultipliers.diagonalOfAnchor,
      },
      {
        name: 'leftBottomDistance',
        distance: Math.hypot(hdLabelLeftToAnchor, vdLabelBottomToAnchor),
        energyMultiplier: placementPenaltyMultipliers.diagonalOfAnchor,
      },
    ]

    const bestLeaderLineOption = _(leaderLinePositionOptions)
      .sortBy('distance')
      .first()

    if (!bestLeaderLineOption.length < 1) {
      throw new Error('There were no leaderLine placement options available')
    }

    return bestLeaderLineOption
  }

  labeler.moveLabel = function ({ label, x, y }) {
    // TODO : abort if x==x and y==y

    label.x = x
    label.y = y
    labeler.enforceBoundaries(label)
    addMinMaxAreaToRectangle(label)
    collisionTree.remove(label)
    collisionTree.insert(label)

    // enforceBoundaries modified label.x and label.y so final x,y may not equal the requested x,y
    return { x: label.x, y: label.y }
  }

  labeler.enforceBoundaries = function (label) {
    if (label.x + label.width / 2 > w2) { label.x = w2 - label.width / 2 }
    if (label.x - label.width / 2 < w1) { label.x = w1 + label.width / 2 }
    if (label.y > h2) { label.y = h2 }
    if (label.y - label.height < h1) { label.y = h1 + label.height }
  }

  labeler.mcmove = function ({ label }) {
    const x = label.x + (random.real(0, 1) - 0.5) * max_move
    const y = label.y + (random.real(0, 1) - 0.5) * max_move

    labeler.moveLabel({ label, x, y })
  }


  labeler.mcrotate = function (point) {
    // Monte Carlo rotation move

    const { label, anchor } = point

    // random angle
    const angle = (random.real(0, 1) - 0.5) * max_angle
    const s = Math.sin(angle)
    const c = Math.cos(angle)

    // translate label (relative to anchor at origin):
    const translated = {
      x: label.x - (anchor.x + label.width / 2),
      y: label.y - anchor.y,
    }

    // rotate label
    const rotated = {
      x: translated.x * c - translated.y * s,
      y: translated.x * s + translated.y * c,
    }

    // translate label back
    // TODO XXX: feels like this should be
    //   label.x = x_new + (anchor.x + label.width / 2)
    //   but when I use that I get regressions.
    //   so this works but do not understand why
    const x = rotated.x + anchor.x - label.width / 2
    const y = rotated.y + anchor.y

    labeler.moveLabel({ label, x, y })
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

    const activePoints = labeler.chooseActivePoints({ points: pointsWithLabels })

    // TODO: this is no longer accurate as we still do _some_ stuff before this point
    if (!is_placement_algo_on) {
      // Turn off label placement algo if way too many labels given
      console.log("rhtmlLabeledScatter: Label placement turned off! (too many)")
      return resolveFunc()
    } else {
      const startTime = Date.now()
      const generalSweepStats = labeler.generalSweep({ maxSweeps, activePoints })
      const postSweepStats = labeler.postSweep({ activePoints })

      console.log(JSON.stringify(_.merge({}, generalSweepStats, postSweepStats, {
        labelCount: lab.length,
        activePointCount: activePoints.length,
        anchorCount: anc.length,
        duration: Date.now() - startTime,
      })))

      return resolveFunc()
    }
  }

  labeler.chooseActivePoints = function ({ points }) {
    return points.filter(point => {
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
  }

  labeler.generalSweep = function ({ maxSweeps, activePoints }) {
    let stats = {
      duration: 0,
      acc: 0,
      acc_worse: 0,
      rej: 0,
    }

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

        if (currTemperature > 1) {console.error(`got temp > 1 : ${currTemperature}`)}
        if (currTemperature < 0) {console.error(`got temp < 0 : ${currTemperature}`)}
        // if (oddsPreTemp > 1) {console.error(`got odds pre temp > 1 : ${oddsPreTemp}`)}
        // if (oddsPreTemp < 0) {console.error(`got odds pre temp < 0 : ${oddsPreTemp}`)}
        // if (odds > 1) {console.error(`got odds > 1 : ${odds}`)}
        // if (odds < 0) {console.error(`got odds < 0 : ${odds}`)}

        acceptChange = random.real(0, 1) < odds

        if (LOG_LEVEL >= OUTER_LOOP_LOGGING) { console.log(`${label.shortText}: worse: old: ${old_energy.toFixed(2)}, new: ${new_energy.toFixed(2)}, temp: ${currTemperature.toFixed(2)}, odds: ${odds.toFixed(5)}, oddsPreTemp: ${oddsPreTemp.toFixed(5)} acceptChange: ${acceptChange}`) }
      }

      dynamicObservations.adjustments.attempts++
      if (acceptChange) {
        stats.acc += 1
        if (new_energy >= old_energy) { stats.acc_worse += 1}
        dynamicObservations.energy.current = new_energy
        dynamicObservations.adjustments.success++
        if (!_.has(dynamicObservations.energy, 'worst') || dynamicObservations.energy.worst < new_energy) { dynamicObservations.energy.worst = new_energy }
        if (!_.has(dynamicObservations.energy, 'best') || dynamicObservations.energy.best > new_energy) { dynamicObservations.energy.best = new_energy }
      } else {
        // move back to old coordinates
        labeler.moveLabel({ label, x: x_old, y: y_old })
        stats.rej += 1
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

    stats.maxSweeps = debugForceMaxRounds | maxSweeps
    stats.maxRounds = maxRounds
    stats.monte_carlo_rounds = stats.acc + stats.rej
    stats.pass_rate = Math.round((stats.acc / (stats.acc + stats.rej)) * 1000) / 1000
    stats.accept_worse_rate = Math.round((stats.acc_worse / (stats.acc_worse + stats.rej)) * 1000) / 1000

    if (LOG_LEVEL >= MINIMAL_LOGGING) {
      console.log(`rhtmlLabeledScatter: Label placement general sweep complete after ${currentRound} sweeps. accept/reject: ${stats.acc}/${stats.rej} (accept_worse: ${stats.acc_worse})`)
    }

    return stats
  }

  labeler.postSweep = function ({ activePoints }) {
    const proportionOfLabelsToAdjust = 0.4 // TODO expose as config variable
    const currentEnergies = _(activePoints).map(point => `${point.label.shortText}: ${_.get(point, 'observations.dynamic.energy.current', -1).toFixed(2)}`).value()
    const sortedEnergies = _(activePoints).map('observations.dynamic.energy.current').value().sort((a, b) => a - b)
    const boundaryEnergy = sortedEnergies[Math.floor(sortedEnergies.length * (1 - proportionOfLabelsToAdjust ))]
    const worstPoints = activePoints.filter(point => point.observations.dynamic.energy.current >= boundaryEnergy)

    const stats = {
      postAdjustmentCandidates: worstPoints.length,
      postAdjustmentsMade: 0,
      postAlignmentsMade: 0
    }

    _(worstPoints).each(point => {
      const adjustmentMade = labeler.targetedCardinalAdjustment({ point })
      if (adjustmentMade) { stats.postAdjustmentsMade++ }
    })

    _(activePoints).each(point => {
      const adjustmentMade = labeler.alignLabelIfBetter({ point })
      if (adjustmentMade) { stats.postAlignmentsMade++ }
    })

    return stats
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

    const chosenOption = labeler.chooseBestLabelPosition({ point, options })

    if (POST_SWEEP_OPTION_LOGGING) {
      console.log(`${label.shortText} done target adjustment. Energy before: ${energyBefore} Energy after: ${dynamicObservations.energy.current}. chosenOption: ${chosenOption.nickname}`)
      console.log(`${label.shortText}: options`)
      console.log(options)
      console.log('chosenOption')
      console.log(JSON.stringify(chosenOption, {}, 2))
    }

    dynamicObservations.energy.current = chosenOption.energy
    dynamicObservations.energy.best = chosenOption.energy

    return chosenOption.nickname !== 'last'
  }

  labeler.alignLabelIfBetter = function ({ point }) {
    const {
      label,
      anchor,
      observations: {
        static: staticObservations,
        dynamic: dynamicObservations
      }
    } = point

    const energyBefore = dynamicObservations.energy.current

    const options = [
      {  nickname: 'last', x: label.x, y: label.y },
      {  nickname: 'horizontal_aligned', x: anchor.x, y: label.y },
      // {  nickname: 'vertical_aligned', x: label.x, y: anchor.y + label.height / 4 }, // NB disabled as visual inspection of snapshots showed this was not worth it
    ]

    const chosenOption = labeler.chooseBestLabelPosition({ point, options })

    dynamicObservations.energy.current = chosenOption.energy
    dynamicObservations.energy.best = chosenOption.energy

    if (POST_SWEEP_OPTION_LOGGING) {
      console.log(`${anchor.shortText}: done straighten point. energy before: ${energyBefore} after: ${dynamicObservations.energy.current}. chosenOption: ${chosenOption.nickname}`)
    }

    return chosenOption.nickname !== 'last'
  }

  labeler.chooseBestLabelPosition = function ({ point, options }) {
    const { label } = point
    _(options).each(option => {
      labeler.moveLabel({ label, x: option.x, y: option.y })
      // NB note the adjusted coords (moveLabel may not accept input due to hard wall boundaries)
      option.x = label.x
      option.y = label.y

      const { energy, energyParts } = labeler.detailedEnergy(point)
      option.energy = energy
      option.energyParts = energyParts
    })

    const bestOption = _(options)
      .sortBy('energy')
      .first()

    labeler.moveLabel({ label, x: bestOption.x, y: bestOption.y })

    return bestOption
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
          labeler.moveLabel({
            label,
            x: label.x,
            y: anchor.y + label.height / 4
          })
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
    maxX: box.maxX + right,
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
