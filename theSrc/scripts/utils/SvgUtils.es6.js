/* global _ */
// import _ from 'lodash';

class SvgUtils {
  static setSvgBBoxWidthAndHeight(dataArray, svgArray) {
    _(dataArray).each((dataElem, index) => {
      if (!dataElem.width && !dataElem.height) {
        dataElem.width = svgArray[0][index].getBBox().width;
        dataElem.height = svgArray[0][index].getBBox().height;
      }
    });
  }
}

module.exports = SvgUtils;
