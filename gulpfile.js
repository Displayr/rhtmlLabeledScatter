const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

const dontRegisterTheseTasks = ['testVisual', 'testVisual_s']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })
