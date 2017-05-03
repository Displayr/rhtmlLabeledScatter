import $ from 'jquery';
import _ from 'lodash';
import LabeledScatter from '../../scripts/LabeledScatter.js';

let exampleCounter = 0;

// NB The window.stateUpdates is used by the visualTesting suite to check what stateCallbacks are made
window.stateUpdates = [];
const stateChangedCallback = (newState) => {
  window.stateUpdates.push(_.clone(newState));
};

const addLinkToIndex = function () {
  const indexLinkContainer = $('<div>')
    .addClass('index-link');

  const indexLink = $('<a>')
    .attr('href', '/')
    .html('back to index');

  indexLinkContainer.append(indexLink);
  return $('body').prepend(indexLinkContainer);
};

const addExampleTo = function () {
  const exampleNumber = `example-${exampleCounter++}`;

  const element = $(this);
  element.addClass(exampleNumber);

  const exampleConfig = $(this).data();

  const exampleName = exampleConfig.config;
  const stateName = exampleConfig.state;
  const width = exampleConfig.width || window.innerWidth;
  const height = exampleConfig.height || window.innerHeight - 75;

  if (_.isNaN(width)) { throw new Error(`Invalid width: '${width}'`); }
  if (_.isNaN(height)) { throw new Error(`Invalid height: '${height}'`); }
  if (!exampleName) { throw new Error(`must provide config path for example ${exampleNumber}`); }

  const configPromise = new Promise((resolve, reject) => {
    $.ajax(`/internal_www/scripts/data/${exampleName}/config.json`).done(resolve).error(reject);
  });

  const statePromise = new Promise((resolve, reject) => {
    if (stateName) {
      $.ajax(`/internal_www/scripts/data/${exampleName}/${stateName}.json`).done(resolve).error(reject);
    } else {
      resolve({});
    }
  });

  Promise.all([configPromise, statePromise]).then(([config, state]) => {
    console.log('loading widget with config');
    console.log(config);

    console.log('loading widget with state');
    console.log(state);

    element.empty();

    const instance = new LabeledScatter(width, height, stateChangedCallback);
    instance.draw(config, `.${exampleNumber}`, state);
  }).catch((error) => {
    console.log(error);
  });
};

$(document).ready(function () {
  addLinkToIndex();
  $('.example').each(addExampleTo);
  $('body').attr('loaded', '');

  // NB "export" addExampleTo function so it can be used in renderExample.html
  window.addExampleTo = addExampleTo;
});