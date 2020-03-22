// Pattern 1
// Browser Logs for "VIS-513.html" (pass):

// Pattern 2
// INFO: http://localhost:9000/js/renderContentPage.js 58136:16 "{\"duration\":51,\"sweep\":500,\"monte_carlo_rounds\":2000,\"pass_rate\":0.02}"

const _ = require('lodash')

const extractStatRegex = new RegExp('monte_carlo_rounds')

function parseLogContents (fileContents, batchName) {
  let tests = []
  _(fileContents).each(line => {
    if (extractStatRegex.test(line)) {
      const stats = JSON.parse(line)
      tests.push(stats)
    }
  })

  return { tests, batchName }
}

module.exports = parseLogContents
