This was run using the old temp fn (Math.EXP based).

The new temp fn is linear and has the min max temp exposed which has a simple predictable effect allowing us to easily control how conservatively we accept energy increases. See [../moreRoundsVaryTemperature](the moreRoundsVaryTemperature experiment) results for effect of temperature and sweep count variations.

Current Settings
* LABEL_ITERATION_RANDOM
* COOLING_PERIOD_PER_SWEEP
* SWEEP_TO_ROUND_MULTIPLIER_DYNAMIC_LABELS

Baseline:
jest theSrc/test/runSnapshotTests.jest.test.js -t labellerSubset | tee -a docs/experiments/more_rounds/baseline.log
