/* global HTMLWidgets */

import LabeledScatter from './LabeledScatter';

HTMLWidgets.widget({
  name: 'rhtmlLabeledScatter',
  type: 'output',

  factory(el, width, height, stateChanged) {
    console.log('rhtmlLabeledScatter: factory called');
    const instance = new LabeledScatter(width, height, stateChanged);
    return {
      resize(newWidth, newHeight) {
        console.log('rhtmlLabeledScatter: resize called');
        return instance.resize(el, newWidth, newHeight);
      },

      renderValue(params, state) {
        console.log('rhtmlLabeledScatter: renderValue called');
        return instance.draw(params, el, state);
      },

      labeledScatter: instance,
    };
  },
});
