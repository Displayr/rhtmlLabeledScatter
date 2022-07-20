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
const POST_SWEEP_LOGGING = 0 // [0,1,2] 2 is most logging
const ENERGY_DETAIL_LOGGING = false
const OVERLAP_LOGGING = 0 // [0,1,2] 2 is most logging
const FINAL_DUMP_LOGGING = false
const LABEL_IN_BUBBLE_PRE_SWEEP_LOGGING = false
const disabledMessage = 'enable ENERGY_DETAIL_LOGGING to track this field'

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
  let isTrendLabel = false
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
  // These two fns are here because they are coupled to labelTopPadding, which is a unconfigured global hard code
  const getResetCoordsForLabelUsingAnchor = ({ anchor, label }) => ({ x: anchor.x, y: anchor.y - anchor.r - labelTopPadding })
  const resetlabelUsingAnchor = ({ anchor, label }) => {
    const { x, y } = getResetCoordsForLabelUsingAnchor({ anchor, label })
    labeler.moveLabel({ label, x, y })
  }

  let max_move = 5.0
  let max_angle = 2 * 3.1415

  let initialTemperature = null
  let finalTemperature = null

  // these weight values are initialised by call to this.weights()
  let weightLineLength = null // leader line length
  let weightLabelToLabelOverlap = null // label-label overlap
  let weightLabelToAnchorOverlap = null // label-anchor overlap
  let weightLineLengthMultipliers = {
    centeredAboveAnchor: null,
    centeredUnderneathAnchor: null,
    besideAnchor: null,
    diagonalOfAnchor: null
  }

  // energy considers:
  //   * distance from label to anchor
  //   * label to label overlap
  //   * label to anchor overlap

  // worst energy possible:
  //   * maxPenalty * Math.hypot(width, height)
  //   * numLabels * labelArea * labelLabelWeight
  //   * numAnchors * labelArea * labelAnchorWeight

  labeler.energy = function ({ label, anchor } = {}, phaseName = '') {
    return labeler.detailedEnergy({ label, anchor }, phaseName).energy
  }

  labeler.detailedEnergy = function ({ label, anchor } = {}, phaseName = '') {
    let energyParts = {
      distanceScore: 0,
      distanceMultiplier: 0,
      distanceMagnitude: 0,
      distanceName: 'N/A',
      labelOverlap: 0,
      labelOverlapCount: (ENERGY_DETAIL_LOGGING) ? 0 : disabledMessage,
      labelOverlapList: (ENERGY_DETAIL_LOGGING) ? [] : disabledMessage,
      anchorOverlap: 0,
      anchorOverlapCount: (ENERGY_DETAIL_LOGGING) ? 0 : disabledMessage,
      anchorOverlapList: (ENERGY_DETAIL_LOGGING) ? [] : disabledMessage
    }

    // Check if label is inside bubble for centering of label inside bubble
    const labIsInsideBubbleAnc = aIsInsideB(label, anchor)
    if (isBubble && labIsInsideBubbleAnc) {
      energyParts.distanceName = 'labInsideBubble'
      label.leaderLineType = 'labInsideBubble'
    } else {
      const bestLeaderLineOption = labeler.chooseBestLeaderLine(label, anchor)
      energyParts.distanceScore = (bestLeaderLineOption.magnitude / maxDistance) * weightLineLength * bestLeaderLineOption.multiplier
      energyParts.distanceMagnitude = bestLeaderLineOption.magnitude
      energyParts.distanceName = bestLeaderLineOption.name
      energyParts.distanceMultiplier = bestLeaderLineOption.multiplier
      label.leaderLineType = bestLeaderLineOption.name
    }

    // TODO: this may need a if numLabels > X then use this ...
    const potentiallyOverlapping = collisionTree.search(label)
    const potentiallyOverlappingLabels = potentiallyOverlapping
      .filter(isLabel)
      .filter(notSameId(label.id))

    const potentiallyOverlappingAnchors = potentiallyOverlapping
      .filter(isAnchor)
      // NB do not filter on notSameId as it is legit to detect the overlap of an anchor and label of the same point

    let xOverlap = null
    let yOverlap = null
    let overlapArea = null

    // penalty for label-label overlap
    // TODO 2D overlap computation is duplicated in a few places
    potentiallyOverlappingLabels.forEach(comparisonLab => {
      xOverlap = Math.max(0, Math.min(comparisonLab.maxX, label.maxX) - Math.max(comparisonLab.minX, label.minX))
      yOverlap = Math.max(0, Math.min(comparisonLab.maxY, label.maxY) - Math.max(comparisonLab.minY, label.minY))
      overlapArea = xOverlap * yOverlap

      if (overlapArea > 0) {
        if (OVERLAP_LOGGING) {
          console.log(`L->L OVERLAP: label '${label.shortText}' and comparisonLab '${comparisonLab.shortText}' overlap ${overlapArea}`)
          if (OVERLAP_LOGGING > 1) {
            console.log(`label '${comparisonLab.shortText}: X ${comparisonLab.minX} - ${comparisonLab.maxX}, comparisonLab Y ${comparisonLab.minY} - ${comparisonLab.maxY}`)
            console.log(`label '${label.shortText}: X ${label.minX} - ${label.maxX}, label Y ${label.minY} - ${label.maxY}`)
          }
        }

        energyParts.labelOverlap += (overlapArea / label.area * weightLabelToLabelOverlap)
        if (ENERGY_DETAIL_LOGGING) {
          energyParts.labelOverlapCount++
          energyParts.labelOverlapList.push({shortText: comparisonLab.shortText, overlapArea})
        }
      }
    })

    // penalty for label-anchor overlap
    // VIS-291 - this is separate because there could be different number of anc to lab
    // TODO 2D overlap computation is duplicated in a few places
    potentiallyOverlappingAnchors.forEach(anchor => {
      // Use adjusted min Y to compensate for extra height given to text,
      // to reduce the gap between labels and their anchors when the anchor is above the labels
      const labelMinY = anchor.id === label.id ? label.adjustedMinY : label.minY

      xOverlap = Math.max(0, Math.min(anchor.maxX, label.maxX) - Math.max(anchor.minX, label.minX))
      yOverlap = Math.max(0, Math.min(anchor.maxY, label.maxY) - Math.max(anchor.minY, labelMinY))
      overlapArea = xOverlap * yOverlap

      // less penalty if the label is overlapping its own bubble
      if (isBubble && anchor.id === label.id) {
        overlapArea /= 2
      }
      if (overlapArea > 0) {

        if (OVERLAP_LOGGING) {
          console.log(`L->A OVERLAP: label '${label.shortText}' and anchor '${anchor.shortText}' overlap ${overlapArea}`)
          if (OVERLAP_LOGGING > 1) {
            console.log(`anchor '${anchor.shortText}: X ${anchor.minX} - ${anchor.maxX}, anchor Y ${anchor.minY} - ${anchor.maxY} anchor R: ${anchor.r}`)
            console.log(`label '${label.shortText}: X ${label.minX} - ${label.maxX}, label Y ${label.minY} - ${label.maxY}`)
          }
        }

        // NB using percentage of anchor "circle" (i.e. anchor.area) to compute totalPercentageOverlap, but the overlapArea was calculated using the anchor "rectangle".
        // Will be innacurate but less expensive this way. Add the Math.min to ensure we do not get a proportion over 1.
        energyParts.anchorOverlap += (Math.min(1, overlapArea / anchor.area) * weightLabelToAnchorOverlap)
        if (ENERGY_DETAIL_LOGGING) {
          energyParts.anchorOverlapCount++
          energyParts.anchorOverlapList.push({shortText: anchor.shortText, overlapArea})
        }
      }
    })
    let energy = energyParts.distanceScore + energyParts.labelOverlap + energyParts.anchorOverlap

    if (ENERGY_DETAIL_LOGGING) {
      console.log(`${phaseName}:energy '${label.shortText}: ${energy}`)
      console.log(energyParts)
    }

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

  // Perf note: this fn runs many many times
  // Avoid lodash in this fn
  labeler.chooseBestLeaderLine = function (label, anchor) {
    // NB negatives are fine here, as they are only used for Math.hypot, and we discard anything not enabled
    let hdLabelLeftToAnchor = label.minX - anchor.maxX
    let hdLabelRightToAnchor = label.maxX - anchor.minX
    let hdLabelCenterToAnchorCenter = (label.maxX - label.width / 2) - anchor.x // TODO does not take into account anchor radius
    let vdLabelCenterToAnchorCenter = (label.maxY - label.height / 2) - anchor.y // TODO does not take into account anchor radius
    let vdLabelBottomToAnchorTop = label.maxY - (anchor.minY - labelTopPadding)
    let vdLabelTopToAnchorBottom = label.adjustedMinY - (anchor.maxY + labelTopPadding)

    const leaderLinePositionOptions = [
      {
        name: 'centerBottomDistance',
        magnitude: Math.hypot(hdLabelCenterToAnchorCenter, vdLabelBottomToAnchorTop),
        multiplier: weightLineLengthMultipliers.centeredAboveAnchor,
      },
      {
        name: 'centerTopDistance',
        magnitude: Math.hypot(hdLabelCenterToAnchorCenter, vdLabelTopToAnchorBottom),
        multiplier: weightLineLengthMultipliers.centeredUnderneathAnchor,
      },
      {
        name: 'leftCenterDistance',
        magnitude: Math.hypot(hdLabelLeftToAnchor, vdLabelCenterToAnchorCenter),
        multiplier: weightLineLengthMultipliers.besideAnchor,
      },
      {
        name: 'rightCenterDistance',
        magnitude: Math.hypot(hdLabelRightToAnchor, vdLabelCenterToAnchorCenter),
        multiplier: weightLineLengthMultipliers.besideAnchor,
      },
      {
        name: 'leftTopDistance',
        magnitude: Math.hypot(hdLabelLeftToAnchor, vdLabelTopToAnchorBottom),
        multiplier: weightLineLengthMultipliers.diagonalOfAnchor,
      },
      {
        name: 'rightBottomDistance',
        magnitude: Math.hypot(hdLabelRightToAnchor, vdLabelBottomToAnchorTop),
        multiplier: weightLineLengthMultipliers.diagonalOfAnchor,
      },
      {
        name: 'rightTopDistance',
        magnitude: Math.hypot(hdLabelRightToAnchor, vdLabelTopToAnchorBottom),
        multiplier: weightLineLengthMultipliers.diagonalOfAnchor,
      },
      {
        name: 'leftBottomDistance',
        magnitude: Math.hypot(hdLabelLeftToAnchor, vdLabelBottomToAnchorTop),
        multiplier: weightLineLengthMultipliers.diagonalOfAnchor,
      },
    ]

    const bestLeaderLineOption = leaderLinePositionOptions
      .reduce((acc,cur,idx,src) => {
        return (!acc.name || cur.magnitude < acc.magnitude)
          ? cur : acc
      },{ name: null })

    if (!bestLeaderLineOption.name) {
      throw new Error('There were no leaderLine placement options available')
    }

    return bestLeaderLineOption
  }

  labeler.moveLabel = function ({ label, x, y }) {
    // TODO : abort if x==x and y==y

    // NB the remove fn considers the bbox so you must remove label before altering the coordinates
    collisionTree.remove(label)

    label.x = x
    label.y = y
    labeler.enforceBoundaries(label)
    addMinMaxAreaToRectangle(label)
    addAdjustedMinYToLabel(label)
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

  // TODO duplicate of enforceLabelBoundaries ?
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

    const highestDistancePenalty = _(weightLineLengthMultipliers).values().max() * weightLineLength
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
      const generalSweepCompleteTime = Date.now()
      const postSweepStats = labeler.postSweep({ activePoints })
      const postSweepCompleteTime = Date.now()

      console.log(JSON.stringify(_.merge({}, generalSweepStats, postSweepStats, {
        labelCount: lab.length,
        activePointCount: activePoints.length,
        anchorCount: anc.length,
        duration: postSweepCompleteTime - startTime,
        postSweepDuration: postSweepCompleteTime - generalSweepCompleteTime,
        generalSweepDuration: generalSweepCompleteTime - startTime,
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
        staticObservations.labelPlacedInsideBubble,
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

      if (LOG_LEVEL >= OUTER_LOOP_LOGGING) {
        console.log(`CONSIDERING '${label.shortText}'`)
      }

      const x_old = label.x
      const y_old = label.y

      let old_energy = labeler.energy(point, `general:${currentRound}:old`)

      if (random.real(0, 1) < 0.8) {
        labeler.mcmove(point)
      } else {
        labeler.mcrotate(point)
      }

      let new_energy = labeler.energy(point, `general:${currentRound}:new`)

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
        // TODO best and worst are not kept up to date in the post sweep phases. They are not strictly needed consider removing
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

    if (FINAL_DUMP_LOGGING) {
      console.log('dump state after general sweep')
      console.log(lab)
      console.log(anc)

      _(activePoints).each(point => {
        labeler.detailedEnergy(point,'debug-final-dump')
      })
    }

    return stats
  }

  labeler.recomputeEnergies = ({ activePoints, phaseName }) => {
    // why recompute energies ?
    //   * if I move A to overlap B, both A and B energy changes
    //   * if I am moving A I am also recomputing its old/new energy as part ofthe move, but I did not ALSO recompute B's energy
    _(activePoints).each(point => {
      const energy = labeler.energy(point, `${phaseName}:recompute`)
      point.observations.dynamic.energy.current = energy
    })
  }

  labeler.postSweep = function ({ activePoints }) {
    // TODO clean up this stat object
    // TODO specify a config that controls how many targetedCardinalSweep and the scale of each sweep
    const stats = {
      targetedCardinalSweepOneAdjustments: 0,
      targetedCardinalSweepTwoAdjustments: 0,
      postAlignmentsMade: 0
    }

    if (POST_SWEEP_LOGGING) {
      console.log(`Start postSweep`)
      console.log('all active point energies: ', activePoints.map(point => `"${point.anchor.shortText}": ${point.observations.dynamic.energy.current}`))
    }

    // sweep 1
    let phaseName = 'targetedCardinalSweepOne'
    labeler.recomputeEnergies({ activePoints, phaseName })
    let proportionOfLabelsToAdjust = 0.5 // TODO expose as config variable
    let sortedEnergies = _(activePoints).map('observations.dynamic.energy.current').value().sort((a, b) => a - b)
    let boundaryEnergy = sortedEnergies[Math.floor(Math.max(0,sortedEnergies.length * (1 - proportionOfLabelsToAdjust ) - 1))]
    let worstPoints = activePoints.filter(point => point.observations.dynamic.energy.current >= boundaryEnergy)
    stats[`${phaseName}Candidates`] = worstPoints.length

    if (POST_SWEEP_LOGGING) {
      console.log(`Start ${phaseName}`)
      console.log('worst points: ', worstPoints.map(point => `"${point.anchor.shortText}": ${point.observations.dynamic.energy.current}`))
    }

    _(worstPoints).each(point => {
      const adjustmentMade = labeler.targetedCardinalAdjustment({ point })
      if (adjustmentMade) { stats[`${phaseName}Adjustments`]++ }
    })

    // sweep 2
    phaseName = 'targetedCardinalSweepTwo'
    labeler.recomputeEnergies({ activePoints, phaseName })
    proportionOfLabelsToAdjust = 0.25 // TODO expose as config variable
    sortedEnergies = _(activePoints).map('observations.dynamic.energy.current').value().sort((a, b) => a - b)
    boundaryEnergy = sortedEnergies[Math.floor(Math.max(0,sortedEnergies.length * (1 - proportionOfLabelsToAdjust ) - 1))]
    worstPoints = activePoints.filter(point => point.observations.dynamic.energy.current >= boundaryEnergy)
    stats[`${phaseName}Candidates`] = worstPoints.length

    if (POST_SWEEP_LOGGING) {
      console.log(`Start ${phaseName}`)
      console.log('worst points: ', worstPoints.map(point => `"${point.anchor.shortText}": ${point.observations.dynamic.energy.current}`))
    }

    _(worstPoints).each(point => {
      const adjustmentMade = labeler.targetedCardinalAdjustment({ point })
      if (adjustmentMade) { stats[`${phaseName}Adjustments`]++ }
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
    const widthIncrement = 0.25 * (w2 - w1) / movesPerDirection
    const heightIncrement = 0.25 * (h2 - h1) / movesPerDirection

    const defaultCoords = getResetCoordsForLabelUsingAnchor(point)

    const verticalOptions = _.range(defaultCoords.y - heightIncrement * movesPerDirection, defaultCoords.y + heightIncrement * movesPerDirection, heightIncrement)
      .map((newHeight, i) => ({ nickname: `vertical_${i}`, x: defaultCoords.x, y: newHeight }))
    const horizontalOptions = _.range(defaultCoords.x - widthIncrement * movesPerDirection, defaultCoords.x + widthIncrement * movesPerDirection, widthIncrement)
      .map((newWidth, i) => ({ nickname: `horizontal_${i}`, x: newWidth, y: anchor.y + label.height / 2 }))
    const northEasterlyDiagonal = _.range(verticalOptions.length - 1)
      .map(i => ({ nickname: `NEly_${i}`, x: horizontalOptions[i].x, y: verticalOptions[verticalOptions.length - i - 1].y }))
    const southEasterlyDiagonal = _.range(verticalOptions.length - 1)
      .map(i => ({ nickname: `SEly_${i}`, x: horizontalOptions[i].x, y: verticalOptions[i].y }))

    const options = [
      {  nickname: 'last', x: label.x, y: label.y },
      // TODO use getResetCoordsForLabelUsingAnchor via ...getResetCoordsForLabelUsingAnchor(point)
      {  nickname: 'reset', x: defaultCoords.x, y: defaultCoords.y },
      {  nickname: 'below', x: defaultCoords.x, y: anchor.maxY + labelTopPadding + label.adjustedHeight },
      ...verticalOptions,
      ...horizontalOptions,
      ...northEasterlyDiagonal,
      ...southEasterlyDiagonal
    ]

    const chosenOption = labeler.chooseBestLabelPosition({ point, options, phaseName: 'targetedCardinalAdjustment' })

    if (POST_SWEEP_LOGGING) {
      console.log(`${label.shortText} done target adjustment. Energy before: ${energyBefore} Energy after: ${dynamicObservations.energy.current}. chosenOption: ${chosenOption.nickname}`)
      if (POST_SWEEP_LOGGING > 1) {
        console.log(`${label.shortText}: options`)
        console.log(options)
        console.log('chosenOption')
        console.log(JSON.stringify(chosenOption, {}, 2))
      }
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

    const chosenOption = labeler.chooseBestLabelPosition({ point, options, phaseName: 'alignLabelIfBetter' })

    dynamicObservations.energy.current = chosenOption.energy
    dynamicObservations.energy.best = chosenOption.energy

    if (POST_SWEEP_LOGGING) {
      console.log(`${anchor.shortText}: done straighten point. Energy before: ${energyBefore} after: ${dynamicObservations.energy.current}. chosenOption: ${chosenOption.nickname}`)
      if (POST_SWEEP_LOGGING > 1) {
        console.log(`${label.shortText}: options`)
        console.log(options)
        console.log('chosenOption')
        console.log(JSON.stringify(chosenOption, {}, 2))
      }
    }

    return chosenOption.nickname !== 'last'
  }

  labeler.chooseBestLabelPosition = function ({ point, options, phaseName }) {
    const { label } = point
    _(options).each(option => {
      labeler.moveLabel({ label, x: option.x, y: option.y })
      // NB note the adjusted coords (moveLabel may not accept input due to hard wall boundaries)
      option.x = label.x
      option.y = label.y

      const { energy, energyParts } = labeler.detailedEnergy(point, `${phaseName}:${option.nickname}`, `${option.nickname}`)
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
    _(lab).each(addAdjustedMinYToLabel)
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

  // TODO split the observations and adjustments. the adjustments should be referred to as "pre-sweep" operations
  labeler.makeInitialObservationsAndAdjustments = function () {
    // note this is a broad sweep collision detection (it is using a rectangle to detect sphere overlap)
    // TODO: test each collision more precisely
    points.forEach(point => {
      point.observations = {
        // static observations are made once at beginning of simulation
        static: {
          labelFitsInsideBubble: false,
          labelPlacedInsideBubble: false,
          noInitialCollisionsAndNoNearbyNeighbors: false
        },
        // dynamic observations are updated through the annealing process
        dynamic: {
          adjustments: {
            attempts: 0, // TODO are these used ?
            success: 0 // TODO are these used ?
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

        const labelAndAnchorBoundingBox = combinedBoundingBox(label, anchor)
        // TODO: make this a percentage of layout, maybe considering layout density ?
        const expandedLabelAndAnchorBoundingBox = expandBox({
          box: labelAndAnchorBoundingBox,
          up: 20,
          down: 20,
          left: 20,
          right: 20
        })

        // TODO 2D overlap computation is duplicated in a few places
        const xOverlap = Math.max(0, Math.min(anchor.maxX, label.maxX) - Math.max(anchor.minX, label.minX))
        const yOverlap = Math.max(0, Math.min(anchor.maxY, label.maxY) - Math.max(anchor.minY, label.minY))
        const selfOverlap = (xOverlap * yOverlap) > 0

        const nearbyThings = collisionTree.search(expandedLabelAndAnchorBoundingBox)
          .filter(notSameId(id))

        point.observations.static.noInitialCollisionsAndNoNearbyNeighbors = !selfOverlap && (nearbyThings.length === 0)

        if (label.width < 2 * anchor.r && label.height < 2 * anchor.r && (label.color !== anchor.color || anchor.fillOpacity < 1) && !isTrendLabel) {
          point.observations.static.labelFitsInsideBubble = true
          point.observations.static.labelPlacedInsideBubble = true
          labeler.moveLabel({
            label,
            x: label.x,
            y: anchor.y + label.height / 4
          })
        }
      }
    })

    // NB now tie break all the labelPlacedInsideBubble based on Z magnitude
    // see testset label_inside_bubble_descending_z_series for why this is necessary
    // TODO extract into FN
    const labelIsPlacedInsideBubble = (point) => _.get(point, 'observations.static.labelPlacedInsideBubble', false)

    // NB TODO this is inefficient. If this is copied into inner loop will be big impact
    // Current position: it only runs once per anchor in a pre sweep phase so inefficiency is ok
    const labelToPoint = label => {
      const x = _.find(points, { id: label.id });
      return x
    }

    _(points)
      .filter(labelIsPlacedInsideBubble)
      .sort((a, b) => b.anchor.r - a.anchor.r)
      .forEach(biggerPoint => {
        const {label, anchor, pinned, id} = biggerPoint
        // this is being manipulated in this loop so double check if this point has been changed to not be placed inside bubble
        if (biggerPoint.observations.static.labelPlacedInsideBubble) {
          // all remaining labelPlacedInsideBubble should be smaller than this label (because we sorted by radius), so change them to not be placed inside bubble (and let the general sweep place them)


          /* NB it is not obvious how we can assume all the overlapping labels are for smaller points. Here is the logic:
            * in the outer loop we have sorted by anchor radius descending so in pass 0 we have the label for the biggest anchor
            * for each iteration of the loop, we find all overlapping labels that are placed inside the anchor, and we move them outside the anchor
            * so on pass 1, we cannot encounter label 0 (which is the only "bigger" label) because if they overlapped then we would
              have moved label 1 outside of the bubble. This extends by induction to all other labels in the outer loop
           */
          const thru = (name) => (x) => { console.log(name); return x }
          const potentiallyCollidingLabels = collisionTree.search(label)
            .filter(isLabel)
            .filter(notSameId(id))
            .map(labelToPoint)
            .filter(labelIsPlacedInsideBubble)
            .forEach(smallerPoint => {
              smallerPoint.observations.static.labelPlacedInsideBubble = false
              resetlabelUsingAnchor(smallerPoint)
              if (LABEL_IN_BUBBLE_PRE_SWEEP_LOGGING) {
                console.log(`${biggerPoint.label.shortText}(${biggerPoint.anchor.r}) bumping ${smallerPoint.label.shortText}(${smallerPoint.anchor.r})`)
              }
            })
        }
      })

    if (OBSERVATION_LOGGING) {
      const stats = _.transform(points, (result, { label, anchor, observations }) => {
        if (anchor) { result.anchors++ }
        if (label) { result.labels++ }
        if (observations.static.labelFitsInsideBubble) { result.labelFitsInsideBubble++ }
        if (observations.static.labelPlacedInsideBubble) { result.labelPlacedInsideBubble++ }
        if (observations.static.noInitialCollisionsAndNoNearbyNeighbors) { result.noInitialCollisionsAndNoNearbyNeighbors++ }
      }, {
        isBubble,
        anchors: 0,
        labels: 0,
        labelFitsInsideBubble: 0,
        labelPlacedInsideBubble: 0,
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
  
  labeler.isBubble = function (x) {
    if (!arguments.length) return isBubble
    isBubble = x
    return labeler
  }

  labeler.isTrendLabel = function (x) {
    if (!arguments.length) return isTrendLabel
    isTrendLabel = x
    return labeler
  }

  labeler.pinned = function (x) {
    // user positioned labels
    if (!arguments.length) return pinned
    pinned = x
    return labeler
  }
  
  labeler.weights = function (weights) {
    // Weights used in the label placement algorithm
    weightLineLength = _.get(weights, 'distance.base')
    weightLineLengthMultipliers = _.get(weights, 'distance.multipliers')
    weightLabelToLabelOverlap = _.get(weights, 'labelLabelOverlap')
    weightLabelToAnchorOverlap = _.get(weights, 'labelPlacementWeightLabelLabelOverlap')

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

const addAdjustedMinYToLabel = label => {
  label.adjustedMinY = label.y - label.adjustedHeight
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
    maxY: box.maxY + down,
  }
}

const combinedBoundingBox = (...boxes) => {
  return _(boxes)
    .filter(x => !_.isNull(x) && !_.isUndefined(x))
    .reduce((minMaxes, box) => ({
      minX: Math.min(minMaxes.minX, box.minX),
      maxX: Math.max(minMaxes.maxX, box.maxX),
      minY: Math.min(minMaxes.minY, box.minY),
      maxY: Math.max(minMaxes.maxY, box.maxY),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  })
}

const aIsInsideB = (a, b) => {
  return (a.minX >= b.minX) &&
    (a.maxX <= b.maxX) &&
    (a.minY >= b.minY) &&
    (a.maxY <= b.minY)
}
