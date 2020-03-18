import _ from 'lodash'
import $ from 'jquery'

$(document).ready(function () {
  const urlVars = getUrlVars()
  const experimentA = decodeURIComponent(urlVars['experimentA'])
  const configA = decodeURIComponent(urlVars['configA'])
  const experimentB = decodeURIComponent(urlVars['experimentB'])
  const configB = decodeURIComponent(urlVars['configB'])
  const snapshotName = decodeURIComponent(urlVars['snapshotName'])

  $('a.back').attr('href', `/experiments/ui/cross-experiment.html?experimentA=${experimentA}&configA=${configA}&experimentB=${experimentB}&configB=${configB}`)
  $('body').append($(`<h1>snapshot: ${snapshotName}</h1>`))
  $('body').append($(`<h2>experimentA: ${experimentA}</h2>`))
  $('body').append($(`<h2>configA: ${configA}</h2>`))
  $('body').append($(`<h2>experimentB: ${experimentB}</h2>`))
  $('body').append($(`<h2>configB: ${configB}</h2>`))

  const headerRowElement = $('<div class="row">')
  headerRowElement.append($(`<div class="column-header">${experimentA} : ${configA}</div>`))
  headerRowElement.append($(`<div class="column-header">${experimentB} : ${configB}</div>`))
  $('body').append(headerRowElement)

  const rowElement = $('<div class="row">')
  const imageA = $(`<img class="experiment-image" src="/experiments/${experimentA}/results/${configA}/snapshots/${snapshotName}-snap.png"/>`)
  const imageB = $(`<img class="experiment-image" src="/experiments/${experimentB}/results/${configB}/snapshots/${snapshotName}-snap.png"/>`)

  rowElement.append(imageA)
  rowElement.append(imageB)
  $('body').append(rowElement)
})

const getUrlVars = () => {
  var vars = {}
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
  _(hashes).each(hashString => {
    var hash = hashString.split('=')
    if (!_.has(vars, hash[0])) { vars[hash[0]] = hash[1] } else if (_.has(vars, hash[0]) && _.isString(vars[hash[0]])) { vars[hash[0]] = [ vars[hash[0]], hash[1] ] } else if (_.has(vars, hash[0]) && _.isArray(vars[hash[0]])) { vars[hash[0]].push(hash[1]) }
  })
  return vars
}
