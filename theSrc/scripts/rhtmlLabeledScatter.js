/* global HTMLWidgets */

import LabeledScatter from './LabeledScatter'

HTMLWidgets.widget({
  name: 'rhtmlLabeledScatter',
  type: 'output',

  factory (element, width, height, stateChanged) {
    console.log('rhtmlLabeledScatter: factory called')
    const instance = new LabeledScatter(element, width, height, stateChanged)
    return {
      resize (newWidth, newHeight) {
        console.log('rhtmlLabeledScatter: resize called')
        return instance.resize(element, newWidth, newHeight)
      },

      renderValue (config, userState) {
        console.log('rhtmlLabeledScatter: renderValue called')
        // TODO add try catch with DisplayError block
        instance.setConfig(config)
        instance.setUserState(userState)
        return instance.draw()
      },

      labeledScatter: instance
    }
  }
})
