const shell = require('shelljs')
const fs = require('fs')
const { mkdirpSync, removeSync } = require('fs-extra')

const runBaseline = false
const runExperiments = true

// set ENV=experiment
// set BRANCH=moreRounds
process.env['ENV'] = 'experiment'
process.env['BRANCH'] = 'moreRoundsOldTemperature'

const start = Date.now()
const secondsSinceStart = () => `${((Date.now() - start) / 1000).toFixed(0)}s`

const absoluteProjectRoot = '/Users/kyle/projects/numbers/scatter'
const labelOverrideFile = `${absoluteProjectRoot}/theSrc/internal_www/config/labellerSubsetOverrides.json`
const setOverides = (overrides) => {
  fs.writeFileSync(labelOverrideFile, JSON.stringify(overrides), 'utf8')
}

const snapshotSrcDirectory = `${absoluteProjectRoot}/theSrc/test/snapshots/experiment/moreRoundsOldTemperature/testPlans/labellerSubsetExperiment`
const resultsDirectory = `${absoluteProjectRoot}/theSrc/test/experiments/moreRoundsOldTemperature/results`
const baselineDirectory = `${absoluteProjectRoot}/theSrc/test/experiments/moreRoundsOldTemperature/results/baseline`
const snapshotTesterPath = `${absoluteProjectRoot}/theSrc/test/runSnapshotTests.jest.test.js`
const snapshotTestCommand = `jest ${snapshotTesterPath} -t labellerSubsetExperiment 2> /dev/null > /dev/null`

const baseline = {
  name: 'noSweeps',
  override: { 'labelPlacementNumSweeps': 0 }
}

const experiments = [
  { name: 'old_temp-1x', override: { 'labelPlacementNumSweeps': 500 } },
  { name: 'old_temp-2x', override: { 'labelPlacementNumSweeps': 1000 } },
  { name: 'old_temp-4x', override: { 'labelPlacementNumSweeps': 2000 } }
]

/*
 * set ENV=experiment
 * set BRANCH=moreRounds
 * write baseline
 * save baseline in experiment directory
 * for each experiment:
 *   * run jest with baseline in place
 *   * save diffs
 *   * delete baseline
 *   * run jest without baseline in place
 *   * save snapshots
*/

removeSync(resultsDirectory)
mkdirpSync(resultsDirectory)
removeSync(snapshotSrcDirectory)

if (runBaseline) {
  console.log(secondsSinceStart(), 'running baseline')
  setOverides(baseline.override)
  shell.exec(snapshotTestCommand)
  shell.cp('-R', snapshotSrcDirectory, baselineDirectory)
} else {
  console.log(secondsSinceStart(), 'skipping baseline')
}

if (runExperiments) {
  for (let i = 0; i < experiments.length; i++) {
    console.log(secondsSinceStart(), `running experiment ${experiments[i].name}`)

    removeSync(`${resultsDirectory}/${experiments[i].name}`)
    mkdirpSync(`${resultsDirectory}/${experiments[i].name}`)
    setOverides(experiments[i].override)

    // // restore baseline
    // shell.cp('-R', baselineDirectory, snapshotSrcDirectory)
    // shell.exec(snapshotTestCommand)
    // shell.cp('-R', `${snapshotSrcDirectory}/__diff_output__`, `${resultsDirectory}/${experiments[i].name}/diffs`)

    // now remove baseline so we dont get diffs and our snapshots are saved
    removeSync(snapshotSrcDirectory)
    shell.exec(snapshotTestCommand)
    shell.cp('-R', snapshotSrcDirectory, `${resultsDirectory}/${experiments[i].name}/snapshots`)
  }
} else {
  console.log(secondsSinceStart(), 'skipping experiments')
}
