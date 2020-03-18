import _ from 'lodash'
import $ from 'jquery'

// TODO generate this programatically
const getExperimentList = () => {
  return new Promise((resolve) => {
    resolve([
      'moreRoundsOldTemperature',
      'moreRoundsVaryTemperature'
    ])
  })
}

$(document).ready(function () {
  getExperimentList()
    .then((experimentNames) => {
      renderExperimentList(experimentNames)
    })
})

// NB reusing style definitions from index.css
const renderExperimentList = (experimentNames) => {
  const testGroupContainer = $(`
    <div class="test-plan-group-container">
      <h3 class="test-plan-group-name">Experiments</h3>
      <ul class="test-cases-container">
      </ul>
    </div>
  `)

  $('body').append(testGroupContainer)

  _(experimentNames).each(experimentName => {
    const experimentUrl = `/experiments/ui/experiment.html?experimentName=${experimentName}`
    const listItem = $(`
      <li class="test-case">
        <a class="load-link" href="${experimentUrl}" class="test-link">${experimentName}</a>
      </li>
    `)

    $('ul.test-cases-container').append(listItem)
  })
}
