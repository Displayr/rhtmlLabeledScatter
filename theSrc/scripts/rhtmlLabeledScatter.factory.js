import LabeledScatter from './LabeledScatter'

module.exports = function (element, width, height, stateChanged) {
  const instance = new LabeledScatter(element, width, height, stateChanged)
  return {
    resize (newWidth, newHeight) {
      instance.resize(element, newWidth, newHeight)
    },

    renderValue (config, userState) {
      // TODO add try catch with DisplayError block
      instance.setConfig(config)
      instance.setUserState(userState)
      instance.draw()
    },

    labeledScatter: instance,
  }
}
