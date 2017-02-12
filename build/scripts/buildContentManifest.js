

const _ = require('lodash');
const path = require('path');
const recursiveReaddirSync = require('recursive-readdir-sync');

const baseContentPath = path.join(__dirname, '../../theSrc/internal_www/content');
const webPrefix = '/content/';

const getContentFiles = function () {
    const htmlExtensionRegex = new RegExp(/\.html$/);
    const contentTemplateRegex = new RegExp(/content_template\.html$/);
    return recursiveReaddirSync(baseContentPath)
        .filter(absolutePath => htmlExtensionRegex.test(absolutePath))
        .filter(absolutePath => !contentTemplateRegex.test(absolutePath))
        // NB +1 to strip leading slash
        .map(absolutePath => absolutePath.substring(baseContentPath.length + 1))
        .sort();
};

const groupContentFiles = function (contentFilePaths) {
    const groupedFiles = {};
    _(contentFilePaths).each((contentFilePath) => {
        const parts = contentFilePath.split('/');
        if (parts.length >= 2) {
            const contentType = parts[0];

            if (!_.has(groupedFiles, contentType)) {
                groupedFiles[contentType] = [];
            }
            groupedFiles[contentType].push(`${webPrefix}${contentFilePath}`);
        }
    });
    return groupedFiles;
};

module.exports = function () {
    return groupContentFiles(getContentFiles());
};