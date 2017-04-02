const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const initializeApplitools = require('../../build/scripts/initializeApplitools');

module.exports = function () {
  chai.use(chaiAsPromised);

  this.context = {};

  this.expect = chai.expect;

  // TODO remove global passing and use browser.params
  this.eyes = initializeApplitools.getEyes(global.visualDiffConfig);
};
