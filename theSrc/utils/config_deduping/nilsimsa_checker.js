const _ = require('lodash')
const { Nilsimsa } = require('nilsimsa')

const paths = require('./paths')

const configs = _(paths)
  .map(path => {
    return {
      path: path,
      group: path.split('/')[path.split('/').length - 2],
      name: _.last(path.split('/')).replace('.json', ''),
      content: require(`../../../${path}`),
    }
  })
  .map(config => {
    config.digest = new Nilsimsa(JSON.stringify(config.content)).digest('hex')
    return config
  })
  .value()

// console.log(JSON.stringify(configs, {}, 2))

_(configs).each((baseConfig, i) => {
  const similar = _(configs)
    .each((config, j) => {
      if (i === j) {
        config.score = 0
        return
      }
      config.score = Nilsimsa.compare(baseConfig.digest, config.digest)
    })
    .filter(config => config.score > 110)

  if (similar.length > 0) {
    console.log(`Base: ${baseConfig.group} ${baseConfig.name}`)
    _(similar).each(config => console.log(`  ${config.score}: ${config.group} ${config.name}`))
    console.log('')
    console.log(`    vimdiff ${baseConfig.path} ${_(similar).map('path').join(' ')}`)
    console.log('')
    console.log('')
  }
})
