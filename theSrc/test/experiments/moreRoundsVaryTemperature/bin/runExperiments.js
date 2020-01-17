const shell = require('shelljs')
const fs = require('fs')
const { mkdirpSync, removeSync } = require('fs-extra')

const absoluteProjectRoot = '/Users/kyle/projects/numbers/scatter'
const labelOverrideFile = `${absoluteProjectRoot}/theSrc/internal_www/config/labellerSubsetOverrides.json`
const setOverides = (overrides) => {
  fs.writeFileSync(labelOverrideFile, JSON.stringify(overrides), 'utf8')
}

const snapshotSrcDirectory = `${absoluteProjectRoot}/theSrc/test/snapshots/experiment/moreRoundsVaryTemp/testPlans/labellerSubsetExperiment`
const resultsDirectory = `${absoluteProjectRoot}/theSrc/test/experiments/moreRoundsVaryTemperature/results`
const baselineDirectory = `${absoluteProjectRoot}/theSrc/test/experiments/moreRoundsVaryTemperature/results/baseline`
const snapshotTesterPath = `${absoluteProjectRoot}/theSrc/test/runSnapshotTests.jest.test.js`
const snapshotTestCommand = `jest ${snapshotTesterPath} -t labellerSubsetExperiment 2> /dev/null > /dev/null`
// const snapshotTestCommand = `jest ${snapshotTesterPath} -t labellerSubsetExperiment`

const baseline = {
  name: 'noSweeps',
  override: { 'labelPlacementNumSweeps': 0 }
}

const experiments = [
  { name: '0.01-0.0001-1x', override: { 'labelPlacementTemperatureInitial': 0.01, 'labelPlacementTemperatureFinal': 0.0001, 'labelPlacementNumSweeps': 500 } },
  { name: '0.01-0.0001-2x', override: { 'labelPlacementTemperatureInitial': 0.01, 'labelPlacementTemperatureFinal': 0.0001, 'labelPlacementNumSweeps': 1000 } },
  { name: '0.01-0.0001-4x', override: { 'labelPlacementTemperatureInitial': 0.01, 'labelPlacementTemperatureFinal': 0.0001, 'labelPlacementNumSweeps': 2000 } },
  { name: '0.01-0.0001-8x', override: { 'labelPlacementTemperatureInitial': 0.01, 'labelPlacementTemperatureFinal': 0.0001, 'labelPlacementNumSweeps': 2000 } },
  { name: '0.1-0.001-1x', override: { 'labelPlacementTemperatureInitial': 0.1, 'labelPlacementTemperatureFinal': 0.001, 'labelPlacementNumSweeps': 500 } },
  { name: '0.1-0.001-2x', override: { 'labelPlacementTemperatureInitial': 0.1, 'labelPlacementTemperatureFinal': 0.001, 'labelPlacementNumSweeps': 1000 } },
  { name: '0.1-0.001-4x', override: { 'labelPlacementTemperatureInitial': 0.1, 'labelPlacementTemperatureFinal': 0.001, 'labelPlacementNumSweeps': 2000 } },
  { name: '0.1-0.001-8x', override: { 'labelPlacementTemperatureInitial': 0.1, 'labelPlacementTemperatureFinal': 0.001, 'labelPlacementNumSweeps': 2000 } },
  { name: '1-0.01-1x', override: { 'labelPlacementTemperatureInitial': 1, 'labelPlacementTemperatureFinal': 0.01, 'labelPlacementNumSweeps': 500 } },
  { name: '1-0.01-2x', override: { 'labelPlacementTemperatureInitial': 1, 'labelPlacementTemperatureFinal': 0.01, 'labelPlacementNumSweeps': 1000 } },
  { name: '1-0.01-4x', override: { 'labelPlacementTemperatureInitial': 1, 'labelPlacementTemperatureFinal': 0.01, 'labelPlacementNumSweeps': 2000 } },
  { name: '1-0.01-8x', override: { 'labelPlacementTemperatureInitial': 1, 'labelPlacementTemperatureFinal': 0.01, 'labelPlacementNumSweeps': 2000 } }
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

// set ENV=experiment
// set BRANCH=moreRounds
process.env['ENV'] = 'experiment'
process.env['BRANCH'] = 'moreRoundsVaryTemp'

removeSync(resultsDirectory)
mkdirpSync(resultsDirectory)
removeSync(snapshotSrcDirectory)

console.log('running baseline')
setOverides(baseline.override)
shell.exec(snapshotTestCommand)
shell.cp('-R', snapshotSrcDirectory, baselineDirectory)

for (let i = 0; i < experiments.length; i++) {
  console.log(`running experiment ${experiments[i].name}`)

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
