/* global fetch */
import _ from 'lodash'
import $ from 'jquery'
import jsyaml from 'js-yaml'

$(document).ready(function () {
  const urlVars = getUrlVars()
  const experimentA = decodeURIComponent(urlVars['experimentA'])
  const configA = decodeURIComponent(urlVars['configA'])
  const experimentB = decodeURIComponent(urlVars['experimentB'])
  const configB = decodeURIComponent(urlVars['configB'])

  $('body').append($(`<h2>experimentA: ${experimentA}</h2>`))
  $('body').append($(`<h2>configA: ${configA}</h2>`))
  $('body').append($(`<h2>experimentB: ${experimentB}</h2>`))
  $('body').append($(`<h2>configB: ${configB}</h2>`))

  getSnapshotList(experimentA)
    .then(snapshotList => {
      renderList({ snapshotList, experimentA, configA, experimentB, configB })
    })
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

const getSnapshotList = (experimentName) => fetch(`/experiments/${experimentName}/testplan.yaml`)
  .then(response => response.text())
  .then(jsyaml.safeLoad)
  .then(extractSnapshotNamesFromTestPlan)

const extractSnapshotNamesFromTestPlan = (testPlan) => {
  return _(testPlan.configs)
    .map(({ config: configString, note, status }) => {
      const lastConfigPart = _.last(configString.split('|'))
      const lastNamePart = _.last(lastConfigPart.split('.'))
      return { snapshotName: lastNamePart, note, status }
    })
    .value()
}

// NB reusing style definitions from index.css
const renderList = ({ snapshotList, experimentA, configA, experimentB, configB }) => {
  const testGroupContainer = $(`
    <div class="test-plan-group-container">
      <h3 class="test-plan-group-name">Snapshots</h3>
      <ul class="test-cases-container">
      </ul>
    </div>
  `)

  $('body').append(testGroupContainer)

  _(snapshotList).each(({ snapshotName }) => {
    const snapshotComparisonUrl = `/experiments/ui/snapshot/cross-experiment.html?experimentA=${experimentA}&configA=${configA}&experimentB=${experimentB}&configB=${configB}&snapshotName=${snapshotName}`
    const listItem = $(`
      <li class="test-case">
        <a class="load-link" href="${snapshotComparisonUrl}" class="test-link">${snapshotName}</a>
      </li>
    `)

    $('ul.test-cases-container').append(listItem)
  })
}
