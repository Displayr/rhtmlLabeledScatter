const fs = require('fs')
const _ = require('lodash')
const { defaultConfig } = require('../../../scripts/buildConfig')

const paths = require('./paths')

_(paths)
  .each(path => {
    let changed = false
    const content = require(`../../../${path}`)
    // console.log(`analysing ${path}`)
    _(defaultConfig).each((value, key) => {
      // console.log(`  default ${key}:${value}`)
      // console.log(`  config  ${key}:${content[key]}`)

      if (_.has(content, key) && content[key] === value) {
        // console.log(`    would delete`)
        changed = true
        delete content[key]
      }
    })

    // also remove
    // * labelPlacementMaxAngle: 142: 6.283
    // * axisFontColor: Black
    // * plotBorderColor: Black

    if (content['labelPlacementMaxAngle'] === 6.283) {
      delete content['labelPlacementMaxAngle']
      changed = true
    }

    if (content['axisFontColor'] === 'Black') {
      delete content['axisFontColor']
      changed = true
    }

    if (content['plotBorderColor'] === 'Black') {
      delete content['plotBorderColor']
      changed = true
    }

    // not implemented
    // tooltipTitleFontColor
    // toolTipTitleFontFamily
    // tooltipTitleFontSize
    if (_.has(content, 'tooltipTitleFontColor')) {
      delete content['tooltipTitleFontColor']
      changed = true
    }

    if (_.has(content, 'toolTipTitleFontFamily')) {
      delete content['toolTipTitleFontFamily']
      changed = true
    }

    if (_.has(content, 'tooltipTitleFontSize')) {
      delete content['tooltipTitleFontSize']
      changed = true
    }

    if (changed) {
      console.log(`rewriting ${path}`)
      fs.writeFileSync(`${__dirname}/../../../${path}`, JSON.stringify(content, {}, 2), 'utf8')
    } else {
      console.log(`skipping ${path}`)
    }
  })
