const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const initializeApplitools = require('../../build/scripts/initializeApplitools');

const bddSupportPath = path.join(__dirname);
const worldExtensions = _.without(fs.readdirSync(bddSupportPath), 'world.js')
  .map( (supportFileName) => { return require(path.join(bddSupportPath, supportFileName)); });

module.exports = function() {
  chai.use(chaiAsPromised);

  this.context = {};

  this.expect = chai.expect;

  // TODO remove global passing and use browser.params
  this.eyes = initializeApplitools.getEyes(global.visualDiffConfig);

  _(worldExtensions).each((worldExtension) => worldExtension(this) );
};
