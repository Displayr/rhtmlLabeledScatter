const _ = require('lodash')

const paths = require('./paths')
const observations = {}

const toSkip = [
  'footer',
  'group',
  'label',
  'subtitle',
  'title',
  'title',
  'userPositionedLabs',
  'X',
  'xTitle',
  'Y',
  'yTitle',
  'Z',
  'zTitle',
]

console.log(`considering ${paths.length} configs`)
_(paths)
  .each(path => {
    const content = require(`../../../${path}`)
    // console.log(`analysing ${path}`)
    _(content).each((value, key) => {
      if (_.includes(toSkip, key)) { return }

      if (!_.has(observations, key)) { observations[key] = {} }
      if (!_.has(observations[key], value)) { observations[key][value] = 0 }
      observations[key][value]++
    })
  })

_(observations)
  .each((values, key) => {
    console.log(`looking at ${key}`)
    _(values).each((count, value) => {
      if (count > 1) {
        console.log(`  ${count}: ${value}`)
      }
    })
  })
