//
// const widgetName = require('../../build/config/widget.config.json').widgetName;
//
// // NB global.visualDiffConfig is set globally in protractor.conf.js
// const eyes = require('../../build/scripts/initializeApplitools').getEyes(global.visualDiffConfig)
//
// describe('Demonstrate interaction with widget before taking snapshot', function () {
//
//     beforeEach(function () {
//         browser.ignoreSynchronization = true;
//     });
//
//     it('red is selected', function() {
//
//         eyes.open(
//             browser,
//             `${widgetName} ${global.visualDiffConfig.testLabel}`,
//             'red is selected',
//             { width: global.visualDiffConfig.browserWidth, height: global.visualDiffConfig.browserHeight }
//         );
//
//         return browser.get(`/content/examples/default.html`)
//                 .then( () => {
//                 console.log(`Page examples/default.html is loaded`);
//         // TODO this wait is not working !
//         // return browser.wait(browser.isElementPresent(by.css('svg.rhtmlwidget-0')));
//         return new Promise( (resolve, reject) => {
//             setTimeout( () => {
//             return resolve()
//         }, 3000)
//     })
//     })
//         .then( () => {
//             console.log(`widget is loaded`);
//         element(by.css('.text.red')).click()
//         eyes.checkRegionBy(by.css(`svg.rhtmlwidget-0`), 'redSelected');
//         return Promise.resolve();
//     }).then( () => {
//             console.log("test complete");
//         eyes.close(false);
//     }).catch( (error) => {
//             console.log("test error:");
//         console.log(error)
//         eyes.close(false);
//     })
//     })
// });

