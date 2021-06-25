const _ = require('lodash')

// compute these stats
// independent:
//   * min duration
// * max duration
// * average duration
// * median duration
// * min pass rate
// * max pass rate
// * average pass rate
// * median pass rate
//
//
// first pass: use positional index as identifier
// after: incorporate scenario into stats and use as identifier
// * regen local link
//

function compareTwoTestRuns ({ baseline, candidate }) {
  console.log(`using ${baseline.batchName} as baseline`)
  console.log(`using ${candidate.batchName} as candidate`)

  const independentStats = {
    baseline: computeIndependent(baseline.tests),
    candidate: computeIndependent(candidate.tests),
  }

  printIndependentStats(independentStats)

  const mergedTests = getMergedTests({ baseline: baseline.tests, candidate: candidate.tests })

  computeDistributions(mergedTests)

  computeComparison(mergedTests)

  return mergedTests
}

function computeIndependent (testStatArray) {
  const hasAcceptWorseRateStat = _.has(testStatArray[0], 'accept_worse_rate')
  const stats = {
    min_duration: _(testStatArray).map('duration').min().toFixed(0),
    max_duration: _(testStatArray).map('duration').max().toFixed(0),
    average_duration: _(testStatArray).meanBy('duration').toFixed(0),
    median_duration: median(_(testStatArray).map('duration').value()).toFixed(0),
    min_pass_rate: _(testStatArray).map('pass_rate').min().toFixed(3),
    max_pass_rate: _(testStatArray).map('pass_rate').max().toFixed(3),
    average_pass_rate: _(testStatArray).meanBy('pass_rate').toFixed(3),
    median_pass_rate: median(_(testStatArray).map('pass_rate').value()).toFixed(3),
    min_accept_worse_rate: (hasAcceptWorseRateStat) ? _(testStatArray).map('accept_worse_rate').min().toFixed(3) : 'N/A',
    max_accept_worse_rate: (hasAcceptWorseRateStat) ? _(testStatArray).map('accept_worse_rate').max().toFixed(3) : 'N/A',
    average_accept_worse_rate: (hasAcceptWorseRateStat) ? _(testStatArray).meanBy('accept_worse_rate').toFixed(3) : 'N/A',
    median_accept_worse_rate: (hasAcceptWorseRateStat) ? median(_(testStatArray).map('accept_worse_rate').value()).toFixed(3) : 'N/A',
  }
  return stats
}

function printIndependentStats ({ baseline: a, candidate: b }) {
  console.log(`
                            baseline : candidate
   min_duration           : ${a.min_duration.padEnd(8, ' ')} : ${b.min_duration.padEnd(8, ' ')} 
   max_duration           : ${a.max_duration.padEnd(8, ' ')} : ${b.max_duration.padEnd(8, ' ')} 
   average_duration       : ${a.average_duration.padEnd(8, ' ')} : ${b.average_duration.padEnd(8, ' ')} 
   median_duration        : ${a.median_duration.padEnd(8, ' ')} : ${b.median_duration.padEnd(8, ' ')} 
   min_pass_rate          : ${a.min_pass_rate.padEnd(8, ' ')} : ${b.min_pass_rate.padEnd(8, ' ')} 
   max_pass_rate          : ${a.max_pass_rate.padEnd(8, ' ')} : ${b.max_pass_rate.padEnd(8, ' ')} 
   average_pass_rate      : ${a.average_pass_rate.padEnd(8, ' ')} : ${b.average_pass_rate.padEnd(8, ' ')} 
   median_pass_rate       : ${a.median_pass_rate.padEnd(8, ' ')} : ${b.median_pass_rate.padEnd(8, ' ')} 
   min_accept_worse_rate     : ${a.min_accept_worse_rate.padEnd(8, ' ')} : ${b.min_accept_worse_rate.padEnd(8, ' ')} 
   max_accept_worse_rate     : ${a.max_accept_worse_rate.padEnd(8, ' ')} : ${b.max_accept_worse_rate.padEnd(8, ' ')} 
   average_accept_worse_rate : ${a.average_accept_worse_rate.padEnd(8, ' ')} : ${b.average_accept_worse_rate.padEnd(8, ' ')} 
   median_accept_worse_rate  : ${a.median_accept_worse_rate.padEnd(8, ' ')} : ${b.median_accept_worse_rate.padEnd(8, ' ')}
  `)
}

function getMergedTests ({ baseline, candidate }) {
  const nestUnderField = (array, type) => array.map(item => ({ scenario: item.scenario, [type]: item }))

  const merged = _.merge(
    _.keyBy(nestUnderField(baseline, 'baseline'), 'scenario'),
    _.keyBy(nestUnderField(candidate, 'checkpoint'), 'scenario')
  )
  return _.values(merged)
}

function computeComparison (mergedTests) {
  const mergedTestsWithBothRecords = _(mergedTests)
    .filter(({ baseline, checkpoint }) => baseline && checkpoint)
    .value()

  const makeDurationStatements = (dimension, thresholds) => {
    _(thresholds).each(threshold => {
      const baselineBetterCount = _(mergedTestsWithBothRecords)
        .filter(({ baseline, checkpoint }) => baseline[dimension] < (1 - threshold) * checkpoint[dimension])
        .size()
      console.log(` baseline beats checkpoint on ${dimension} by more than ${100 - 100 * (1 - threshold)}%: ${baselineBetterCount}`)
    })

    _(thresholds).each(threshold => {
      const checkpointBetterCount = _(mergedTestsWithBothRecords)
        .filter(({ baseline, checkpoint }) => checkpoint[dimension] < (1 - threshold) * baseline[dimension])
        .size()
      console.log(` checkpoint beats baseline on ${dimension} by more than ${100 - 100 * (1 - threshold)}%: ${checkpointBetterCount}`)
    })
  }

  const makePassrateStatements = (dimension, thresholds) => {
    _(thresholds).each(threshold => {
      const baselineBetterCount = _(mergedTestsWithBothRecords)
        .filter(({ baseline, checkpoint }) => baseline[dimension] > (1 + threshold) * checkpoint[dimension])
        .size()
      console.log(` baseline beats checkpoint on ${dimension} by more than ${100 - 100 * (1 - threshold)}%: ${baselineBetterCount}`)
    })

    _(thresholds).each(threshold => {
      const checkpointBetterCount = _(mergedTestsWithBothRecords)
        .filter(({ baseline, checkpoint }) => checkpoint[dimension] > (1 + threshold) * baseline[dimension])
        .size()
      console.log(` checkpoint beats baseline on ${dimension} by more than ${100 - 100 * (1 - threshold)}%: ${checkpointBetterCount}`)
    })
  }

  console.log('counts:')
  makeDurationStatements('duration', [0.1, 0.25, 0.5])
  makePassrateStatements('pass_rate', [0.1, 0.25, 0.5])
  makePassrateStatements('accept_worse_rate', [0.1, 0.25, 0.5])
}

function computeDistributions (mergedTests) {
  const durationRatioBuckets = {}
  const passRateDeltaBuckets = {}
  const acceptWorseRateDeltaBuckets = {}

  _(mergedTests).each(test => {
    if (_.has(test, 'checkpoint') && _.has(test, 'baseline')) {
      test.durationRatio = test.checkpoint.duration / test.baseline.duration
      test.passRateDelta = test.checkpoint.pass_rate - test.baseline.pass_rate
      test.acceptWorseRateDelta = test.checkpoint.accept_worse_rate - test.baseline.accept_worse_rate

      const durationRatioBucket = Math.ceil(test.durationRatio * 10) / 10
      test.durationRatioBucket = durationRatioBucket
      if (!_.has(durationRatioBuckets, durationRatioBucket)) { durationRatioBuckets[durationRatioBucket] = 0 }
      durationRatioBuckets[durationRatioBucket]++

      const passRateDeltaBucket = test.passRateDelta.toFixed(3)
      test.passRateDeltaBucket = passRateDeltaBucket
      if (!_.has(passRateDeltaBuckets, passRateDeltaBucket)) { passRateDeltaBuckets[passRateDeltaBucket] = 0 }
      passRateDeltaBuckets[passRateDeltaBucket]++

      const acceptWorseRateDeltaBucket = test.acceptWorseRateDelta.toFixed(3)
      test.acceptWorseRateDeltaBucket = acceptWorseRateDeltaBucket
      if (!_.has(acceptWorseRateDeltaBuckets, acceptWorseRateDeltaBucket)) { acceptWorseRateDeltaBuckets[acceptWorseRateDeltaBucket] = 0 }
      acceptWorseRateDeltaBuckets[acceptWorseRateDeltaBucket]++
    }
  })

  const printDistribution = (buckets) => {
    const sortedKeys = Object.keys(buckets).sort(function (a, b) { return parseFloat(a) - parseFloat(b) })

    _(sortedKeys).each(key => {
      const value = buckets[key] || 0
      console.log(` ${key.padStart(3, ' ')}: ${value}`)
    })
  }

  console.log('duration ratio frequencies (candidate / baseline):')
  printDistribution(durationRatioBuckets)
  console.log('')

  console.log('pass rate delta frequencies (candidate - baseline):')
  printDistribution(passRateDeltaBuckets, 2)
  console.log('')

  console.log('accept worse rate delta frequencies (candidate - baseline):')
  printDistribution(acceptWorseRateDeltaBuckets, 2)
  console.log('')
}

function median (array) {
  array = array.sort()
  if (array.length % 2 === 0) { // array with even number elements
    return (array[array.length / 2] + array[(array.length / 2) - 1]) / 2
  } else {
    return array[(array.length - 1) / 2] // array with odd number elements
  }
}

module.exports = compareTwoTestRuns
