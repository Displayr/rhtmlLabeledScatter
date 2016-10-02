(function() {

    d3.labeler = function() {
        // Use Mersenne Twister seeded random number generator
        var random = new Random(Random.engines.mt19937().seed(1));
        // var random = new Random();

        var lab = [],
            anc = [],
            h1 = 1,
            h2 = 1,
            w1 = 1,
            w2 = 1,
            labeler = {},
            svg = {},
            pinned = [],
            minLabWidth = Infinity;

        // var investigate = 7;
        // var investigate2 = 14;
        var labelTopPadding = 5;
        var max_move = 5.0,
            max_angle = 2*3.1415,
            acc = 0,
            rej = 0;

        // weights
        var w_len = 10.0, // leader line length
            w_inter = 1.0, // leader line intersection
            w_lablink = 2.0, // leader line-label intersection
            w_lab2 = 12.0, // label-label overlap
            w_lab_anc = 8; // label-anchor overlap

        // booleans for user defined functions
        var user_energy = false,
            user_schedule = false;

        var user_defined_energy,
            user_defined_schedule;

        initLabBoundaries = function(lab, anc, i) {
            if (lab[i].x + lab[i].width/2 > w2) lab[i].x = w2 - lab[i].width/2;
            if (lab[i].x - lab[i].width/2 < w1) lab[i].x = w1 + lab[i].width/2;
            if (lab[i].y > h2) lab[i].y = h2;
            if (lab[i].y - lab[i].height < h1) lab[i].y = h1 + lab[i].height;
        };

        energy = function(index) {
            // energy function, tailored for label placement

            var m = lab.length,
                ener = 0,
                dx = lab[index].x - anc[index].x,
                dx2 = lab[index].x - 4 - lab[index].width/2 - anc[index].x,
                dx3 = lab[index].x + lab[index].width/2 + 4 - anc[index].x,
                dy = lab[index].y - (anc[index].y - 5),
                dy2 = (lab[index].y - (lab[index].height - labelTopPadding)) - anc[index].y,
                dy3 = (lab[index].y - lab[index].height/2) - anc[index].y,
                dist = Math.sqrt(dx * dx + dy * dy),
                dist2 = Math.sqrt(dx * dx + dy2 * dy2),
                dist3 = Math.sqrt(dx2 * dx2 + dy3 * dy3),
                dist4 = Math.sqrt(dx3 * dx3 + dy3 * dy3),
                dist5 = Math.sqrt(dx2 * dx2 + dy2 * dy2),
                dist6 = Math.sqrt(dx3 * dx3 + dy * dy),
                dist7 = Math.sqrt(dx3 * dx3 + dy2 * dy2),
                dist8 = Math.sqrt(dx2 * dx2 + dy * dy),
                overlap = true;

            // penalty for length of leader line
            perfect2penalty = 1.5;
            perfect3penalty = 8;
            perfect4penalty = 15;
            minDist = Math.min(dist, dist2, dist3, dist4, dist5, dist6, dist7, dist8);
            switch(minDist) {
                case dist:
                    ener += dist * w_len;
                    break;
                case dist2:
                    ener += dist2 * w_len * perfect2penalty;
                    break;
                case dist3:
                    ener += dist3 * w_len * perfect3penalty;
                    break;
                case dist4:
                    ener += dist4 * w_len * perfect3penalty;
                    break;
                case dist5:
                    ener += dist5 * w_len * perfect4penalty;
                    break;
                case dist6:
                    ener += dist6 * w_len * perfect4penalty;
                    break;
                case dist7:
                    ener += dist7 * w_len * perfect4penalty;
                    break;
                case dist8:
                    ener += dist8 * w_len * perfect4penalty;
            }

            var x21 = lab[index].x - lab[index].width/2,
                y21 = lab[index].y - (lab[index].height - labelTopPadding),
                x22 = lab[index].x + lab[index].width/2,
                y22 = lab[index].y;
            var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

            for (var i = 0; i < m; i++) {
                if (i != index) {

                    // penalty for intersection of leader lines
                    overlap = intersect(anc[index].x, lab[index].x + lab[index].width/2, anc[i].x, lab[i].x + lab[i].width/2,
                        anc[index].y, lab[index].y, anc[i].y, lab[i].y);
                    if (overlap) ener += w_inter;

                    // penalty for label-label overlap
                    x11 = lab[i].x - lab[i].width/2;
                    y11 = lab[i].y - lab[i].height;
                    x12 = lab[i].x + lab[i].width/2;
                    y12 = lab[i].y;
                    x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
                    y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
                    overlap_area = x_overlap * y_overlap;
                    ener += (overlap_area * w_lab2);
                }

                // penalty for label-anchor overlap
                x11 = anc[i].x - anc[i].r;
                y11 = anc[i].y - anc[i].r;
                x12 = anc[i].x + anc[i].r;
                y12 = anc[i].y + anc[i].r;
                x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
                y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
                overlap_area = x_overlap * y_overlap;
                ener += (overlap_area * w_lab_anc);

                // penalty for label-leader line intersection
                var intersecBottom = intersect(lab[index].x - lab[index].width/2, lab[index].x + lab[index].width/2, anc[i].x, lab[i].x + lab[i].width/2,
                    lab[index].y, lab[index].y, anc[i].y, lab[i].y
                );

                var intersecTop = intersect(lab[index].x - lab[index].width/2, lab[index].x + lab[index].width/2, anc[i].x, lab[i].x + lab[i].width/2,
                    lab[index].y-lab[index].height, lab[index].y-lab[index].height, anc[i].y, lab[i].y
                );
                if (intersecBottom) ener += w_lablink;
                if (intersecTop) ener += w_lablink;
            }
            return ener;
        };

        mcmove = function(currT) {
            // Monte Carlo translation move

            // select a random label
            var i = Math.floor(random.real(0,1) * lab.length);

            // Ignore if user moved label
            if (_.includes(pinned, lab[i].id)) { return; }

            // save old coordinates
            var x_old = lab[i].x;
            var y_old = lab[i].y;

            // old energy
            var old_energy;
            if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
            else {old_energy = energy(i)}

            // random translation
            lab[i].x += (random.real(0,1) - 0.5) * max_move;
            lab[i].y += (random.real(0,1) - 0.5) * max_move;

            // hard wall boundaries
            if (lab[i].x + lab[i].width/2 > w2) lab[i].x = w2 - lab[i].width/2;
            if (lab[i].x - lab[i].width/2 < w1) lab[i].x = w1 + lab[i].width/2;
            if (lab[i].y > h2) lab[i].y = h2;
            if (lab[i].y - lab[i].height < h1) lab[i].y = h1 + lab[i].height;

            // new energy
            var new_energy;
            if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
            else {new_energy = energy(i)}

            // delta E
            var delta_energy = new_energy - old_energy;

            if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
                acc += 1;
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
                lab[i].x = x_old;
                lab[i].y = y_old;
                rej += 1;
                // if (i == investigate)
                //   svg.append('rect').attr('x', lab[i].x - lab[i].width/2)
                //                    .attr('y', lab[i].y - lab[i].height)
                //                    .attr('width', lab[i].width)
                //                    .attr('height', lab[i].height)
                //                    .attr('text-anchor', 'middle')
                //                    .attr('fill', 'red')
                //                    .attr('fill-opacity', 0.1);
            }

        };

        mcrotate = function(currT) {
            // Monte Carlo rotation move

            // select a random label
            var i = Math.floor(random.real(0,1) * lab.length);

            // Ignore if user moved label
            if (_.includes(pinned, lab[i].id)) { return; }

            // save old coordinates
            var x_old = lab[i].x;
            var y_old = lab[i].y;

            // old energy
            var old_energy;
            if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
            else {old_energy = energy(i)}

            // random angle
            var angle = (random.real(0,1) - 0.5) * max_angle;

            var s = Math.sin(angle);
            var c = Math.cos(angle);

            // translate label (relative to anchor at origin):
            lab[i].x -= anc[i].x + minLabWidth/2;
            lab[i].y -= anc[i].y;

            // rotate label
            var x_new = lab[i].x * c - lab[i].y * s,
                y_new = lab[i].x * s + lab[i].y * c;

            // translate label back
            lab[i].x = x_new + anc[i].x - lab[i].width/2;
            lab[i].y = y_new + anc[i].y;

            // hard wall boundaries
            if (lab[i].x + lab[i].width/2 > w2) lab[i].x = w2 - lab[i].width/2;
            if (lab[i].x - lab[i].width/2 < w1) lab[i].x = w1 + lab[i].width/2;
            if (lab[i].y > h2) lab[i].y = h2;
            if (lab[i].y - lab[i].height < h1) lab[i].y = h1 + lab[i].height;

            //if (i == investigate)
                //svg.append('rect').attr('x', lab[i].x)
                //    .attr('y', lab[i].y - lab[i].height)
                //    .attr('width', lab[i].width)
                //    .attr('height', lab[i].height)
                //    .attr('fill', 'green')
                //    .attr('fill-opacity', 0.1);

            // new energy
            var new_energy;
            if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
            else {new_energy = energy(i)}

            // delta E
            var delta_energy = new_energy - old_energy;

            if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
                acc += 1;

                // if (i == investigate || i == investigate2) {
                //   console.log('here')
                //   svg.append('rect').attr('x', lab[i].x - lab[i].width/2)
                //                   .attr('y', lab[i].y - lab[i].height)
                //                   .attr('width', lab[i].width)
                //                   .attr('height', lab[i].height)
                //                   .attr('fill', 'blue')
                //                   .attr('fill-opacity', 0.1);
                // }
            } else {
                // move back to old coordinates
                lab[i].x = x_old;
                lab[i].y = y_old;
                rej += 1;
                // if (i == investigate)
                //   svg.append('rect').attr('x', lab[i].x - lab[i].width/2)
                //                   .attr('y', lab[i].y - lab[i].height)
                //                   .attr('width', lab[i].width)
                //                   .attr('height', lab[i].height)
                //                   .attr('fill', 'red')
                //                   .attr('fill-opacity', 0.1);
            }

        };

        intersect = function(x1, x2, x3, x4, y1, y2, y3, y4) {
            // returns true if two lines intersect, else false
            // from http://paulbourke.net/geometry/lineline2d/

            var mua, mub;
            var denom, numera, numerb;

            denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
            numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
            numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

            /* Is the intersection along the the segments */
            mua = numera / denom;
            mub = numerb / denom;
            if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
                return true;
            }
            return false;
        };

        cooling_schedule = function(currT, initialT, nsweeps) {
            // linear cooling
            return (currT - (initialT / nsweeps));
        };

        labeler.start = function(nsweeps) {
            for (var i = 0; i < lab.length; i++) {
                initLabBoundaries(lab, anc, i);
            }
            // main simulated annealing function
            var m = lab.length,
                currT = 1.0,
                initialT = 1.0;

            for (i = 0; i < nsweeps; i++) {
                for (var j = 0; j < m; j++) {
                    if (random.real(0,1) < 0.8) { mcmove(currT); }
                    else { mcrotate(currT); }
                }
                currT = cooling_schedule(currT, initialT, nsweeps);
            }
        };

        labeler.svg = function(x) {
            svg = x;
            return labeler;
        };

        labeler.w1 = function(x) {
            if(!arguments.length) return w;
            w1 = x;
            return labeler;
        };
        labeler.w2 = function(x) {
            if(!arguments.length) return w;
            w2 = x;
            return labeler;
        };

        labeler.h1 = function(x) {
            if(!arguments.length) return h;
            h1 = x;
            return labeler;
        };

        labeler.h2 = function(x) {
            if(!arguments.length) return h;
            h2 = x;
            return labeler;
        };

        labeler.label = function(x) {
            // users insert label positions
            if (!arguments.length) return lab;
            lab = x;
            for(var i=0; i<lab.length;i++) {
                lab[i].y -= 5;

                // determine min labs width for mcrotate
                if (lab[i].width < minLabWidth) minLabWidth = lab[i].width;
                // svg.append('rect')
                //    .attr('x', lab[i].x - lab[i].width/2)
                //    .attr('y', lab[i].y - lab[i].height)
                //    .attr('width', lab[i].width)
                //    .attr('height', lab[i].height)
                //    .attr('fill', 'yellow')
                //    .attr('stroke', 'blue')
                //    .attr('opacity', 0.1);
            }
            return labeler;
        };

        labeler.anchor = function(x) {
            // users insert anchor positions
            if (!arguments.length) return anc;
            anc = x;
            return labeler;
        };

        labeler.pinned = function(x) {
            // user positioned labels
            if (!arguments.length) return pinned;
            pinned = x;
            return labeler;
        };

        labeler.alt_energy = function(x) {
            // user defined energy
            if (!arguments.length) return energy;
            user_defined_energy = x;
            user_energy = true;
            return labeler;
        };

        labeler.alt_schedule = function(x) {
            // user defined cooling_schedule
            if (!arguments.length) return  cooling_schedule;
            user_defined_schedule = x;
            user_schedule = true;
            return labeler;
        };

        return labeler;
    };

})();
