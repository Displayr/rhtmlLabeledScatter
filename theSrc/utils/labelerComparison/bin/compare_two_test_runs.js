const fs = require('fs')
const inquirer = require('inquirer')
const compareTwoTestRuns = require('../lib/compareTwoTestRuns')

const logFiles = fs.readdirSync(`${__dirname}/../stats`)
  .filter(file => file.match(/json$/))

const questions = [
  {
    type: 'list',
    name: 'baselineFile',
    message: 'choose baseline file',
    choices: logFiles,
    default: '',
  },
  {
    type: 'list',
    name: 'candidateFile',
    message: 'choose candidate file',
    choices: logFiles,
    default: '',
  },
]

function go () {
  inquirer
    .prompt(questions)
    .then(compareTestRuns)
    .then(printComparisonObject)
}

function compareTestRuns ({ baselineFile, candidateFile }) {
  const baseline = JSON.parse(fs.readFileSync(`${__dirname}/../stats/${baselineFile}`))
  const candidate = JSON.parse(fs.readFileSync(`${__dirname}/../stats/${candidateFile}`))

  return compareTwoTestRuns({ baseline, candidate })
}

function printComparisonObject (comparisonObject) {
  // console.log(JSON.stringify(comparisonObject, {}, 2))
}

go()
