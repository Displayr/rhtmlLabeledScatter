const compileInternalWebEntryPoint = require('../lib/compileInternalWebEntryPoint')
const path = require('path')

module.exports = function (gulp) {
  return function (done) {
    const basePath = path.join(__dirname, '../../')
    const entryPoint = path.join(basePath, 'theSrc/test/experiments/ui/js/renderCrossExperimentSnapshotList.js')
    const compiledContentDestination = path.join(basePath, 'browser/js/')
    compileInternalWebEntryPoint({ gulp, done, entryPoint, compiledContentDestination })
  }
}
