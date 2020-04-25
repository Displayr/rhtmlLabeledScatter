# Broad Summary of Algorithm

The labeler seeks to find a "pretty good" arrangement of all the labels on the plot within a bounded amount of time. The amount of time spent labelling grows with the amount of labels, and is bounded by the number of operations, not by a hard time limit.

The algorithm first identifies labels that are easy to place optimally : those that have no nearby neighbors. It excludes these labels from further changes. 

Next the labeler does a "probabilistic placement": it makes 1000's of random adjustments to each label, and evaluates whether the new label placement is "better or worse". 
  * It keeps all of the better adjustments 
  * It keeps some of the worse adjustments, in hopes that keeping a worse will help it eventually find an even better position

Finally, the algorithm applies some deterministic adjustments to clean things up to make sure we dont end up with any of those "worse" positions   

# Detailed Description of Algorithm
----

  * Setup Phase:
    * Ensure all the labels are within the plot boundaries
    * Clean up the data structures (combine label array and anchor array)
    * Build a R-tree for optimised collision detection (uses https://github.com/mourner/rbush)
    * Make observations on each point (point is a label+anchor combo)
      * does the anchor collide with other anchors
      * does the label fit inside the bubble
      * does the label have any initial collisions
      * does the label have any nearby labels or anchors

  * Pre Sweep Phases:
    1. ensure that for any "label place inside anchor", if it overlaps with other "label placed inside anchor" that we reposition the lesser label (based on magnitude of bubble)

  * Identify Active Label Set
    * Identify all the labels that are "labels place inside anchor" or any "labels with no initial collisions and no nearby neighbors". **Exclude these from further placement**
    * the remaining labels are called the "active label" set

  * General Sweep
    1. perform a [simulated annealing](https://en.wikipedia.org/wiki/Simulated_annealing) sweep using all the active labels to find the "best" placement of each label. This phase is described [below](#simulated-annealing-phase)
    
  * Post Sweep Phases
    1. Select the worst 50% of the active labels, and perform a `targeted cardinal adjustment` on each. This phase is described [below](#targeted-cardinal-adjustment-phase)
    1. Select the worst 25% of the active labels, and perform a `targeted cardinal adjustment` on each. This phase is described [below](#targeted-cardinal-adjustment-phase)
    1. For each active label, check whether it is better placed if we maintain the current `y` coordinate, but align the `x` coordinate with the anchor 
    

## Simulated Annealing Phase

[Simulated annealing](https://en.wikipedia.org/wiki/Simulated_annealing) is a commonly used technique to find good solutions to complex problems in a short amount of time.

This writeup assumes general knowledge of simulated annealing techniques (read the article above) and focuses on the specifics of this implementation. 

The sweep makes X adjustments, where X is `number_of_active_points × num_sweeps`, and `num_sweeps` is defaulted to 500.

Each adjustment follows these steps:

* choose an active label at random from the set of active labels
* compute the current energy. The energy calculation is described [below](#energy-function)
* make a change
  * 80% chance the change is a "move". Move the label by choosing a new X and a new Y that is between -2.5 to 2.5 pixels different from the current position
  * 20% chance the change is a "rotate". Rotate the label centroid around the anchor between 0° and 360° maintaining distance between anchor and label
    * note we are not rotating the text of the label, just the position of the label, using the anchor as the origin 
* compute the new energy. The energy calculation is described [below](#energy-function)
* If new energy is better (i.e., numerically less) then accept this new label position
* If the new energy is worse (i.e., numerically greater) then probabilistically accept the move
  * The probability of accepting a worse energy is influenced by two factors:
    1. the temperature (what % complete is the simulated annealing phase) : at the beginning we are more likely to accept worse changes. At the end we are less likely to accept worse changes.
    1. the difference in energy. If the new energy is just a bit worse we are more likely to accept the worse position

## Targeted Cardinal Adjustment Phase

For a subset of active labels (currently 50% on pass 1 and 25% on pass 2), for each label build up a list of potential placements, evaluate the energy for each placement, and deterministically (no probability in this phase) pick the best placement. Options considered:
  * the placement chosen by the general phase ("last placement")
  * reseting to the default 3px above the anchor ("reset placement")
  * 10 positions directly above the anchor, ranging from "25% of total height of canvas" above the anchor to just above the anchor   
  * 10 positions directly below the anchor, ranging from "25% of total height of canvas" below the anchor to just above the anchor
  * 10 positions to left of anchor, same 25% of canvas logic   
  * 10 positions to right of anchor, same 25% of canvas logic   
  * 10 positions to NW of anchor, same 25% of canvas logic but this time 25% of canvas above AND to the left   
  * 10 positions to NE of anchor, same 25% of canvas logic   
  * 10 positions to SW of anchor, same 25% of canvas logic   
  * 10 positions to SE of anchor, same 25% of canvas logic   
 
### Why perform two executions of the Targeted Cardinal Adjustment phase ?

  * Imagine label 1 and label 3 both get evaluated in the first round of "Targeted Cardinal Adjustment".
  * A "better" placement of label 1 could get rejected because in that placement label 1 overlapped label 3
  * Next label 3 is evaluated and moved.
  * We want label 1 to get that good placement that was rejected because of the previous placement of label 3
  * So go one more round
  
It could be argued we should keep doing this until we observe zero changes. Have not evaluated if this is a better approach yet ... 

## Energy Function

The energy function produces a numeric value to represent "the goodness" of a label placement, considering all the other labels and anchors in the plot.

The energy function considers (and does not consider) the following things:

  * label orientation relative to the anchor: top is best, bottom is next, then left/right, and finally diagonal. The exact "ideal placement" is described [below](#ideal-label-placement)
  * label distance from the anchor: the shorter the distance between label and anchor the better
  * collisions between labels are penalised
  * collisions between labels and anchor points are penalised (including label collision with its own anchor)
  * (not implemented) collisions between "leader lines" is bad
  * (not implemented) collisions between label and "leader line" is bad

The exact penalty for each is configurable.

## Ideal label placement

* the ideal place for a label is 3 px above the anchor point
* if the plot is a bubble plot (i.e., there are Z values) then
  * IF the label fits inside the bubble (using approximate math)
    * IF the label does not overlap with any other labels inside bubbles 
      * THEN place the label inside the bubble and do not attempt to reposition
    * ELSE choose the label for the bigger bubble and place in the bubble, and move the other label outside its bubble
