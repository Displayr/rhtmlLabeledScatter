/* global fetch */
import _ from 'lodash'
import $ from 'jquery'
import jsyaml from 'js-yaml'

$(document).ready(function () {
  const urlVars = getUrlVars()
  const experimentName = urlVars['experimentName']

  Promise.all([getSnapshotList(experimentName), getExperimentDefinition(experimentName), getExperimentNotes(experimentName)])
    .then(([snapshotList, experimentDefinition, notesHtml]) => {
      const { rows, columns } = experimentDefinition
      renderPage({ experimentName, snapshotList, rows, columns, notesHtml })
    })
})

const getSnapshotList = (experimentName) => fetch(`/experiments/${experimentName}/testplan.yaml`)
  .then(response => response.text())
  .then(jsyaml.safeLoad)
  .then(extractSnapshotNamesFromTestPlan)

const getExperimentDefinition = (experimentName) => fetch(`/experiments/${experimentName}/config.json`)
  .then(response => response.text())
  .then(JSON.parse)

const getExperimentNotes = (experimentName) => fetch(`/experiments/${experimentName}/notes.html`)
  .then(response => response.text())

const extractSnapshotNamesFromTestPlan = (testPlan) => {
  return _(testPlan.configs)
    .map(({ config: configString, note, status }) => {
      const lastConfigPart = _.last(configString.split('|'))
      const lastNamePart = _.last(lastConfigPart.split('.'))
      return { name: lastNamePart, note, status }
    })
    .value()
}

const getUrlVars = () => {
  var vars = {}
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
  _(hashes).each(hashString => {
    var hash = hashString.split('=')
    if (!_.has(vars, hash[0])) { vars[hash[0]] = hash[1] } else if (_.has(vars, hash[0]) && _.isString(vars[hash[0]])) { vars[hash[0]] = [ vars[hash[0]], hash[1] ] } else if (_.has(vars, hash[0]) && _.isArray(vars[hash[0]])) { vars[hash[0]].push(hash[1]) }
  })
  return vars
}

// NB reusing style definitions from index.css
const renderPage = ({ experimentName, snapshotList, rows, columns, notesHtml }) => {
  const preAmble = $(`
    <h1>Experiment: ${experimentName}</h1>
    ${notesHtml}
  `)

  const testGroupContainer = $(`
    <div class="test-plan-group-container">
      <h3 class="test-plan-group-name">Snapshots</h3>
      <ul class="test-cases-container">
      </ul>
    </div>
  `)

  $('body').append(preAmble)
  $('body').append(testGroupContainer)

  _(snapshotList).each(({ name, note = '', status = 'none' }) => {
    const snapshotComparisonUrl = `/experiments/ui/snapshot/?experimentName=${experimentName}&snapshotName=${name}&rows=${rows.join(',')}&columns=${columns.join(',')}&note=${note}&status=${status}`
    const listItem = $(`
      <li class="test-case status-${status}">
        <a class="load-link status-${status}" title="${note}" href="${snapshotComparisonUrl}" class="test-link">${name}</a>
      </li>
    `)

    $('ul.test-cases-container').append(listItem)
  })
}
