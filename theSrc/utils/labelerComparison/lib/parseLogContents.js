// Pattern 1
// Browser Logs for "VIS-513.html" (pass):

// Pattern 2
// INFO: http://localhost:9000/js/renderContentPage.js 58136:16 "{\"duration\":51,\"sweep\":500,\"monte_carlo_rounds\":2000,\"pass_rate\":0.02}"

const _ = require('lodash')

const extractStatRegex = new RegExp('monte_carlo_rounds')
const extractScenarioNameRegex = new RegExp('Browser Logs for "([^"]+)"')

function parseLogContents (fileContents, batchName) {
  let currentScenarioName = null
  let snapshotsInScenarioCount = 0
  let tests = []
  _(fileContents).each(line => {
    const scenarioNameMatch = line.match(extractScenarioNameRegex)
    if (scenarioNameMatch) {
      currentScenarioName = scenarioNameMatch[1].replace(/,/g, '')
      snapshotsInScenarioCount = 0
    }

    if (extractStatRegex.test(line)) {
      snapshotsInScenarioCount++

      const justTheJsonMatch = line.match(/^[^"]+"(.*)"$/)
      let json
      if (justTheJsonMatch) {
        const formattedJson = justTheJsonMatch[1]
        json = formattedJson.replace(/\\"/g, '"')
      } else {
        json = line
      }
      const stats = JSON.parse(json)
      tests.push(_.assign(stats, {
        scenario: (snapshotsInScenarioCount === 1) ? currentScenarioName : `${currentScenarioName}-${snapshotsInScenarioCount}`,
      }))
    }
  })

  return { tests, batchName }
}

module.exports = parseLogContents
