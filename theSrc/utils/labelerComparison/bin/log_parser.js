const fs = require('fs')
const _ = require('lodash')
const inquirer = require('inquirer')
const parseLogContents = require('../lib/parseLogContents')

const logFiles = fs.readdirSync(`${__dirname}/../logs`)
  .filter(file => file.match(/log$/))

const questions = [
  {
    type: 'checkbox',
    name: 'logFiles',
    message: 'choose log file',
    choices: logFiles,
    default: '',
  },
]

function go () {
  inquirer
    .prompt(questions)
    .then(parseLogFile)
}

// Pattern 1
// Browser Logs for "VIS-513.html" (pass):

// Pattern 2
// INFO: http://localhost:9000/js/renderContentPage.js 58136:16 "{\"duration\":51,\"sweep\":500,\"monte_carlo_rounds\":2000,\"pass_rate\":0.02}"

function parseLogFile ({ logFiles }) {
  _(logFiles).each(logFile => {
    console.log('logFile')
    console.log(JSON.stringify(logFile, {}, 2))

    const logFileParts = logFile.split('.')
    const batchName = logFileParts[0]
    const filePath = `${__dirname}/../logs/${logFile}`
    const fileContents = fs.readFileSync(filePath, 'utf8').split('\n')
    const testResults = parseLogContents(fileContents, batchName)

    const statsFilePath = `${__dirname}/../stats/${batchName}.stats.json`
    fs.writeFileSync(statsFilePath, JSON.stringify(testResults, {}, 2), 'utf8')
  })
}

go()
