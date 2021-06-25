/* global HTMLWidgets */

import 'babel-polyfill'
import widgetFactory from './rhtmlLabeledScatter.factory'

HTMLWidgets.widget({
  name: 'rhtmlLabeledScatter',
  type: 'output',
  factory: widgetFactory,
})
