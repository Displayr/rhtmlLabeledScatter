### The decision to accept fn

In both mcmove and mcrotate after making adjustments we make a decision whether to accept the changes or not.

The decision is based on:

* lower energy indicates a better layout placement
* energy score of the layout before the change (i.e., return value of energy fn)
* the energy score of the layout after the change (i.e., return value of energy fn)
* the current temperature of the simulation (starts at 1, ends at near 0, in this sim it linearly decreases per sweep from 1 to near 0)
* a degree of randomness (i.e. call our random generator to get a num)

### Questions about current implementation / desired implemtnation:
* what should range of ideal weight to worst weight be ? Seems the max delta should be kept between +/- 10
* we add to the energy a line length penalty. This is added per line per distance. The effect is that more labels and larger plots push the absolute values and ranges of the energy scores up. Does this mean that the sim will be less likely to advance ?
* should the max moves be proportional to the size of the canvas ?  
* not currently accounting for "leader line intersection" in energy fn
* not currently accounting for "leader line-label intersection" in energy fn
* looks like temperature implementation goes from less likely to more likely to accept, but it should be going from more likely to less likely to accept

### Some example oddsOfAcceptingWorseLayout values 
 
```js


// Master version Accept change if
// random.real(0, 1) < ${Math.exp((old_energy - new_energy) / currTemperature)}
// temp starts at 1, ends at 0


// VIS-513 improved temperature version
// (new_energy < old_energy) || random.real(0, 1) < ${Math.exp((old_energy - new_energy) / currTemperature)}
// temp starts at 100, ends at 1


// Notes on behaviour of different temperatures
// most likely to accept good
// T = 0.01
// T = 1
// T = 100
// least likely to accept good

// most likely to accept bad
// T = 100
// T = 1
// T = 0.01 
// least likely to accept bad


// (current: end of sim) ranging from best to worst
Math.exp((10000 - 1) / 0.01) = Infinity
Math.exp((1000 - 1) / 0.01) = Infinity
Math.exp((100 - 1) / 0.01) = Infinity
Math.exp((10 - 1) / 0.01) = Infinity
Math.exp((5 - 1) / 0.01) = 5.221469689764144e+173
Math.exp((2 - 1) / 0.01) = 2.6881171418161356e+43
Math.exp(0 / 0.01) = 1
Math.exp((1 - 2) / 0.01) = 3.720075976020836e-44
Math.exp((1 - 5) / 0.01) = 1.9151695967140057e-174
Math.exp((1 - 10) / 0.01) = 0
Math.exp((1 - 100) / 0.01) = 0
Math.exp((12- 1000) / 0.01) = 0
Math.exp((1 - 10000) / 0.01) = 0

// (current: beginning of sim) ranging from best to worst
Math.exp((10000 - 1) / 1) = Infinity
Math.exp((1000 - 1) / 1) = Infinity
Math.exp((100 - 1) / 1) = 9.889030319346946e+42
Math.exp((10 - 1) / 1) = 8103.083927575384
Math.exp((5 - 1) / 1) = 54.598150033144236
Math.exp((2- 1) / 1) = 2.718281828459045
Math.exp(0 / 1) = 1
Math.exp((1 - 2) / 1) = 0.36787944117144233
Math.exp((1 - 5) / 1) = 0.01831563888873418
Math.exp((1 - 10) / 1) = 0.00012340980408667956
Math.exp((1 - 100) / 1) = 1.0112214926104486e-43
Math.exp((12- 1000) / 1) = 0
Math.exp((1 - 10000) / 1) = 0



// if we changed it so that it started at 100 and advanced to 1
Math.exp((10000 - 1) / 100) = 2.6613699293533403e+43
Math.exp((1000 - 1) / 100) = 21807.29879823013
Math.exp((100 - 1) / 100) = 2.6912344723492625
Math.exp((10 - 1) / 100) = 1.0941742837052104
Math.exp((5 - 1) / 100) = 1.0408107741923882
Math.exp((2- 1) / 100) = 1.010050167084168
Math.exp(0 / 100) = 1
Math.exp((1 - 2) / 100) = 0.9900498337491681
Math.exp((1 - 5) / 100) = 0.9607894391523232
Math.exp((1 - 10) / 100) = 0.9139311852712282
Math.exp((1 - 100) / 100) = 0.3715766910220457
Math.exp((12- 1000) / 100) = 0.00005118827786912642
Math.exp((1 - 10000) / 100) = 3.757463361145664e-44

```
`
### How is energy computed


