
import labeler from './lib/labeler';
import SvgUtils from './utils/SvgUtils';

class LabelPlacement {
  
  static place(svg, viewBoxDim, anchors, labels, pinnedLabels, labels_svg) {
    console.log('rhtmlLabeledScatter: Running label placement algorithm...');
    
    labeler()
      .svg(this.svg)
      .w1(viewBoxDim.x)
      .w2(viewBoxDim.x + viewBoxDim.width)
      .h1(viewBoxDim.y)
      .h2(viewBoxDim.y + viewBoxDim.height)
      .anchor(anchors)
      .label(labels)
      .pinned(pinnedLabels)
      .start(500);
  
    // Move labels after label placement algorithm
    labels_svg.attr('x', d => d.x)
              .attr('y', d => d.y);
  }
  
  static placeTrendLabels(svg, viewBoxDim, anchors, labels, pinnedLabels) {
    const labels_svg = svg.selectAll('.lab');
    SvgUtils.setSvgBBoxWidthAndHeight(labels, labels_svg);
    this.place(svg, viewBoxDim, anchors, labels, pinnedLabels, labels_svg);
  
    const labels_img_svg = svg.selectAll('.lab-img');
    labels_img_svg.attr('x', d => d.x - (d.width / 2))
                  .attr('y', d => d.y - d.height);
    
  }
  
  static placeLabels(svg, viewBoxDim, anchors, labels, pinnedLabels) {
    const labels_svg = svg.selectAll('.lab');
    const labels_img_svg = svg.selectAll('.lab-img');
    SvgUtils.setSvgBBoxWidthAndHeight(labels, labels_svg);
    const labsToBePlaced = _.filter(labels, l => l.text !== '' || (l.text === '' && l.url !== ''));
    
    this.place(svg, viewBoxDim, anchors, labsToBePlaced, pinnedLabels, labels_svg);
    
    labels_img_svg.attr('x', d => d.x - (d.width / 2))
                  .attr('y', d => d.y - d.height);
  }
}

module.exports = LabelPlacement;