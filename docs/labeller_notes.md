### The decision to accept fn

In both mcmove and mcrotate after making adjustments we make a decision whether to accept the changes or not.

The decision is based on:

* lower energy indicates a better layout placement
* energy score of the layout before the change (i.e., return value of energy fn)
* the energy score of the layout after the change (i.e., return value of energy fn)
* the current temperature of the simulation (starts at 1, ends at near 0, in this sim it linearly decreases per sweep from 1 to near 0)
* a degree of randomness (i.e. call our random generator to get a num)

### Questions about current implementation / desired implemtnation:
* what is a better name for attenuatedImprovementIndex ?
* what should range of ideal weight to worst weight be ? Seems the max delta should be kept between +/- 10
* we add to the energy a line length penalty. This is added per line per distance. The effect is that more labels and larger plots push the absolute values and ranges of the energy scores up. Does this mean that the sim will be less likely to advance ?
* should the max moves be proportional to the size of the canvas ?  
* not currently accounting for "leader line intersection" in energy fn
* not currently accounting for "leader line-label intersection" in energy fn

### Some example attenuatedImprovementIndex values 
 
```js


// Accept change if
// random.real(0, 1) < ${Math.exp((old_energy - new_energy) / currTemperature)}

// beginning of sim ranging from best to worst
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

// end of sim ranging from best to worst
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
```
`
### How is energy computed


