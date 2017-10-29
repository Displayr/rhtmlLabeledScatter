/* eslint-disable */
import Random from 'random-js'
import _ from 'lodash'
import LabelArraySorter from './LabelArraySorter'
import AnchorArraySorter from './AnchorArraySorter'

const labeler = function () {
    // Use Mersenne Twister seeded random number generator
  const random = new Random(Random.engines.mt19937().seed(1))

  let lab = [],
    anc = [],
    h1 = 1,
    h2 = 1,
    w1 = 1,
    w2 = 1,
    labeler = {},
    svg = {},
    resolveFunc = null,
    pinned = [],
    minLabWidth = Infinity,
    labelArraySorter = null,
    anchorArraySorter = null

    // var investigate = 781;
    // var investigate2 = 182;
  const labelTopPadding = 5
  let max_move = 5.0,
    max_angle = 2 * 3.1415,
    acc = 0,
    rej = 0

    // weights
  let w_len = 10.0, // leader line length
    w_inter = 1.0, // leader line intersection
    w_lablink = 2.0, // leader line-label intersection
    w_lab2 = 12.0, // label-label overlap
    w_lab_anc = 8 // label-anchor overlap

    // booleans for user defined functions
  let user_energy = false,
    user_schedule = false

  let user_defined_energy,
    user_defined_schedule

  function energy (index) {
    // energy function, tailored for label placement

    const currLab = lab[index]
    let currAnc = anc.find(e => e.id === currLab.id)
    if (currAnc === undefined) currAnc = anc[index]
    let ener = 0,
      dx = currLab.x - currAnc.x,
      dx2 = currLab.x - 4 - currLab.width / 2 - currAnc.x,
      dx3 = currLab.x + 4 + currLab.width / 2 - currAnc.x,
      dy = currLab.y - (currAnc.y - 5),
      dy2 = (currLab.y - (currLab.height - labelTopPadding)) - currAnc.y,
      dy3 = (currLab.y - currLab.height / 2) - currAnc.y,
      dist = Math.sqrt(dx * dx + dy * dy),
      dist2 = Math.sqrt(dx * dx + dy2 * dy2),
      dist3 = Math.sqrt(dx2 * dx2 + dy3 * dy3),
      dist4 = Math.sqrt(dx3 * dx3 + dy3 * dy3),
      dist5 = Math.sqrt(dx2 * dx2 + dy2 * dy2),
      dist6 = Math.sqrt(dx3 * dx3 + dy * dy),
      dist7 = Math.sqrt(dx3 * dx3 + dy2 * dy2),
      dist8 = Math.sqrt(dx2 * dx2 + dy * dy),
      overlap = true

    // Check if label is inside bubble for centering of label inside bubble
    const labLeftBorder = currLab.x - currLab.width / 2
    const labRightBorder = currLab.x + currLab.width / 2
    const labBotBorder = currLab.y
    const labTopBorder = currLab.y - currLab.height
    const labIsInsideBubbleAnc = (labRightBorder < currAnc.x + currAnc.r) && (labLeftBorder > currAnc.x - currAnc.r) && (labBotBorder < currAnc.y + currAnc.r) && (labTopBorder > currAnc.y - currAnc.r)

    if (labIsInsideBubbleAnc) {
      dy = (currLab.y - currLab.height / 4 - currAnc.y)
      ener += Math.sqrt(dx * dx + dy * dy) * w_len
    } else {
      // penalty for length of leader line
      const perfect2penalty = 1.5
      const perfect3penalty = 8
      const perfect4penalty = 15

      const minDist = Math.min(dist, dist2, dist3, dist4, dist5, dist6, dist7, dist8)
      switch (minDist) {
        case dist:
          ener += dist * w_len
          break
        case dist2:
          ener += dist2 * w_len * perfect2penalty
          break
        case dist3:
          ener += dist3 * w_len * perfect3penalty
          break
        case dist4:
          ener += dist4 * w_len * perfect3penalty
          break
        case dist5:
          ener += dist5 * w_len * perfect4penalty
          break
        case dist6:
          ener += dist6 * w_len * perfect4penalty
          break
        case dist7:
          ener += dist7 * w_len * perfect4penalty
          break
        case dist8:
          ener += dist8 * w_len * perfect4penalty
      }
    }

    let x21 = currLab.x - currLab.width / 2,
      y21 = currLab.y - (currLab.height - labelTopPadding),
      x22 = currLab.x + currLab.width / 2,
      y22 = currLab.y
    let x11,
      x12,
      y11,
      y12,
      x_overlap,
      y_overlap,
      overlap_area

    const overlappingLabs = labelArraySorter.getOverlappingLabelsWithLabelId(index)
    _.forEach(overlappingLabs, (comparisonLab, i) => {
      if (i !== index) {
        // penalty for label-label overlap
        x11 = comparisonLab.x - comparisonLab.width / 2
        y11 = comparisonLab.y - comparisonLab.height
        x12 = comparisonLab.x + comparisonLab.width / 2
        y12 = comparisonLab.y
        x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21))
        y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21))
        overlap_area = x_overlap * y_overlap
        ener += (overlap_area * w_lab2)
      }
    })

    // penalty for label-anchor overlap
    // VIS-291 - this is separate because there could be different number of anc to lab
    // const overlappingAncs = anchorArraySorter.getOverlappingAnchorsWithLabelId(index)
    // _.forEach(overlappingAncs, a => {
    _.forEach(anc, a => {
      x11 = a.x - a.r
      y11 = a.y - a.r
      x12 = a.x + a.r
      y12 = a.y + a.r
      x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21))
      y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21))
      overlap_area = x_overlap * y_overlap
      ener += (overlap_area * w_lab_anc)
    })
    return ener
  }

  function mcmove (currT) {
    // Monte Carlo translation move

    // select a random label
    const i = Math.floor(random.real(0, 1) * lab.length)

    // Ignore if user moved label
    if (_.includes(pinned, lab[i].id)) { return }

    // save old coordinates
    const x_old = lab[i].x
    const y_old = lab[i].y

    // old energy
    let old_energy
    if (user_energy) { old_energy = user_defined_energy(i, lab, anc) } else { old_energy = energy(i) }

    // random translation
    lab[i].x += (random.real(0, 1) - 0.5) * max_move
    lab[i].y += (random.real(0, 1) - 0.5) * max_move

    // hard wall boundaries
    if (lab[i].x + lab[i].width / 2 > w2) lab[i].x = w2 - lab[i].width / 2
    if (lab[i].x - lab[i].width / 2 < w1) lab[i].x = w1 + lab[i].width / 2
    if (lab[i].y > h2) lab[i].y = h2
    if (lab[i].y - lab[i].height < h1) lab[i].y = h1 + lab[i].height

    // new energy
    let new_energy
    if (user_energy) { new_energy = user_defined_energy(i, lab, anc) } else { new_energy = energy(i) }

    // delta E
    const delta_energy = new_energy - old_energy

    if (random.real(0, 1) < Math.exp(-delta_energy / currT)) {
      acc += 1
      labelArraySorter.sortArrays()
      // if (i == investigate || i == investigate2)
      //    svg.append('rect').attr('x', lab[i].x - lab[i].width/2)
      //                  .attr('y', lab[i].y - lab[i].height)
      //                  .attr('width', lab[i].width)
      //                  .attr('height', lab[i].height)
      //                  .attr('text-anchor', 'middle')
      //                  .attr('fill', 'green')
      //                  .attr('fill-opacity', 0.1);
    } else {
      // move back to old coordinates
      lab[i].x = x_old
      lab[i].y = y_old
      rej += 1
      // if (i == investigate)
      //   svg.append('rect').attr('x', lab[i].x - lab[i].width/2)
      //                    .attr('y', lab[i].y - lab[i].height)
      //                    .attr('width', lab[i].width)
      //                    .attr('height', lab[i].height)
      //                    .attr('text-anchor', 'middle')
      //                    .attr('fill', 'red')
      //                    .attr('fill-opacity', 0.1);
    }
  }

  function mcrotate (currT) {
    // Monte Carlo rotation move

    // select a random label
    const i = Math.floor(random.real(0, 1) * lab.length)
    const currLab = lab[i]
    let currAnc = anc.find(e => e.id === currLab.id)
    if (currAnc === undefined) currAnc = anc[i]

    // Ignore if user moved label
    if (_.includes(pinned, currLab.id)) { return }

    // save old coordinates
    const x_old = currLab.x
    const y_old = currLab.y

    // old energy
    let old_energy
    if (user_energy) { old_energy = user_defined_energy(i, lab, anc) } else { old_energy = energy(i) }

    // random angle
    const angle = (random.real(0, 1) - 0.5) * max_angle

    const s = Math.sin(angle)
    const c = Math.cos(angle)

    // translate label (relative to anchor at origin):
    currLab.x -= currAnc.x + minLabWidth / 2
    currLab.y -= currAnc.y

    // rotate label
    let x_new = currLab.x * c - currLab.y * s,
      y_new = currLab.x * s + currLab.y * c

    // translate label back
    currLab.x = x_new + currAnc.x - currLab.width / 2
    currLab.y = y_new + currAnc.y

    // hard wall boundaries
    if (currLab.x + currLab.width / 2 > w2) currLab.x = w2 - currLab.width / 2
    if (currLab.x - currLab.width / 2 < w1) currLab.x = w1 + currLab.width / 2
    if (currLab.y > h2) currLab.y = h2
    if (currLab.y - currLab.height < h1) currLab.y = h1 + currLab.height

    // if (i == investigate)
    // svg.append('rect').attr('x', currLab.x)
    //    .attr('y', currLab.y - currLab.height)
    //    .attr('width', currLab.width)
    //    .attr('height', currLab.height)
    //    .attr('fill', 'green')
    //    .attr('fill-opacity', 0.1);

    // new energy
    let new_energy
    if (user_energy) { new_energy = user_defined_energy(i, lab, anc) } else { new_energy = energy(i) }

    // delta E
    const delta_energy = new_energy - old_energy

    if (random.real(0, 1) < Math.exp(-delta_energy / currT)) {
      acc += 1
      labelArraySorter.sortArrays()
      // if (i == investigate || i == investigate2) {
      //   svg.append('rect').attr('x', currLab.x - currLab.width/2)
      //                   .attr('y', currLab.y - currLab.height)
      //                   .attr('width', currLab.width)
      //                   .attr('height', currLab.height)
      //                   .attr('fill', 'blue')
      //                   .attr('fill-opacity', 0.1);
      // }
    } else {
      // move back to old coordinates
      currLab.x = x_old
      currLab.y = y_old
      rej += 1
      // if (i == investigate)
      //   svg.append('rect').attr('x', currLab.x - currLab.width/2)
      //                   .attr('y', currLab.y - currLab.height)
      //                   .attr('width', currLab.width)
      //                   .attr('height', currLab.height)
      //                   .attr('fill', 'red')
      //                   .attr('fill-opacity', 0.1);
    }
  }

  function intersect (x1, x2, x3, x4, y1, y2, y3, y4) {
    // returns true if two lines intersect, else false
    // from http://paulbourke.net/geometry/lineline2d/

    let mua,
      mub
    let denom,
      numera,
      numerb

    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
    numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)

      /* Is the intersection along the the segments */
    mua = numera / denom
    mub = numerb / denom
    if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
      return true
    }
    return false
  }

  function cooling_schedule (currT, initialT, nsweeps) {
    // linear cooling
    return (currT - (initialT / nsweeps))
  }
  
  function initLabBoundaries (lab) {
    _.forEach(lab, l => {
      if (l.x + l.width / 2 > w2) l.x = w2 - l.width / 2
      if (l.x - l.width / 2 < w1) l.x = w1 + l.width / 2
      if (l.y > h2) l.y = h2
      if (l.y - l.height < h1) l.y = h1 + l.height
    })
  }
  
  labeler.start = function (nsweeps) {
    // anchorArraySorter = new AnchorArraySorter(anc, lab)
    _.forEach(lab, (l, i) => {
      if (!_.includes(pinned, l.id)) {
        l.y -= 5
        // determine min labs width for mcrotate
        if (l.width < minLabWidth) minLabWidth = l.width
      }
    })
    initLabBoundaries(lab)
    
    // main simulated annealing function
    let currT = 1.0
    let initialT = 1.0
  
    function yieldingLoop(count, chunksize, callback, callbackBtwnChuncks, finished) {
      let i = 0;
      (function chunk() {
        let end = Math.min(i + chunksize, count);
        for ( ; i < end; ++i) {
          callback.call(null, i);
        }
        callbackBtwnChuncks()
        if (i < count) {
          setTimeout(chunk, 0);
        } else {
          finished.call(null);
        }
      })();
    }
  
    yieldingLoop(nsweeps * lab.length, lab.length, function(i) {
      if (random.real(0, 1) < 0.8) { mcmove(currT) } else { mcrotate(currT) }
    }, function() {
      currT = cooling_schedule(currT, initialT, nsweeps)
    }, function() {
      console.log("rhtmlLabeledScatter: Label placement complete!")
      resolveFunc()
    });
  }
  
  labeler.promise = function (resolve) {
    resolveFunc = resolve
    return labeler
  }

  labeler.svg = function (x) {
    svg = x
    return labeler
  }

  labeler.w1 = function (x) {
    if (!arguments.length) return w
    w1 = x
    return labeler
  }
  labeler.w2 = function (x) {
    if (!arguments.length) return w
    w2 = x
    return labeler
  }

  labeler.h1 = function (x) {
    if (!arguments.length) return h
    h1 = x
    return labeler
  }

  labeler.h2 = function (x) {
    if (!arguments.length) return h
    h2 = x
    return labeler
  }

  labeler.label = function (x) {
        // users insert label positions
    if (!arguments.length) return lab
    lab = x
    labelArraySorter = new LabelArraySorter(lab)
    return labeler
  }

  labeler.anchor = function (x) {
        // users insert anchor positions
    if (!arguments.length) return anc
    anc = x
    return labeler
  }

  labeler.pinned = function (x) {
        // user positioned labels
    if (!arguments.length) return pinned
    pinned = x
    return labeler
  }

  labeler.alt_energy = function (x) {
        // user defined energy
    if (!arguments.length) return energy
    user_defined_energy = x
    user_energy = true
    return labeler
  }

  labeler.alt_schedule = function (x) {
        // user defined cooling_schedule
    if (!arguments.length) return cooling_schedule
    user_defined_schedule = x
    user_schedule = true
    return labeler
  }

  return labeler
}

module.exports = labeler
/* eslint-enable */
