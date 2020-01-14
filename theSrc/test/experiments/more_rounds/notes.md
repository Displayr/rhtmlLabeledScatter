
Current Settings
* LABEL_ITERATION_RANDOM
* COOLING_PERIOD_PER_SWEEP
* SWEEP_TO_ROUND_MULTIPLIER_DYNAMIC_LABELS

Baseline:
jest theSrc/test/runSnapshotTests.jest.test.js -t labellerSubset | tee -a docs/experiments/more_rounds/baseline.log
