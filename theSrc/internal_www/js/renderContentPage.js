
import $ from 'jquery';
import _ from 'lodash';
// TEMPLATE : you will need to import your widget here
import Template from '../../internal_www/scripts/Template';

let exampleCounter = 0;

const makeFormHtml = () =>
`\
<form class="resize-form" style="padding-top:10px">
  <div style="display:block">
    <label for="width-input">New Width:</label>
    <input type="text" id="width-input" class="width-input" value="200"/>
  </div>
  <div style="display:block">
    <label for="height-input">New Height:</label>
    <input type="text" id="height-input" class="height-input" value="200"/>
  </div>
  <div style="display:block">
    <button class="resize-button">Resize</button>
  </div>
</form>\
`
;

const getRelativeResizersHtml = () =>
// we are inside a pre so you cant newline these ...
`\
<div style="text-align:center;width:100%">
  <button class="relative-resize-button more-button">+25</button> <button class="relative-resize-button less-button">-25</button>
  <button class="relative-resize-button more-width-button">+25 W</button> <button class="relative-resize-button less-width-button">-25 W</button> <button class="relative-resize-button more-height-button">+25 H</button> <button class="relative-resize-button less-height-button">-25 H</button>
</div>\
`
;

const addExampleTo = function (rowConfig) {
    const exampleNumber = `example-${exampleCounter++}`;

    const element = $(this);
    element.addClass(exampleNumber);

    const exampleConfig = _.defaults($(this).data(), rowConfig);

    const configString = element.text();
    const templateConfig = JSON.parse(configString);
    element.empty();

    const configDiv = $('<div>');
    const configPre = $('<pre>')
        .attr('class', 'config')
        .css('height', 'auto')
        .html(JSON.stringify(templateConfig, {}, 2));

    const innerExampleDiv = $('<div>')
        .attr('class', 'inner-example')
        .css('width', `${exampleConfig.exW}`)
        .css('height', `${exampleConfig.exH}`);

    const innerInnerExampleDiv = $('<div>');

    element.append(configDiv.append(configPre));

    // TEMPLATE : you will need to instantiate your widget here
    const instance = new Template(innerInnerExampleDiv, exampleConfig.exW, exampleConfig.exH);

    if (exampleConfig.resizeControls) {
        const relativeResizers = $(getRelativeResizersHtml());
        element.append(relativeResizers);

        const newResizeHandler = function (additionalWidth, additionalHeight) {
            return function (event) {
                event.preventDefault();
                const newWidth = $(`.${exampleNumber} .inner-example`).width() + additionalWidth;
                const newHeight = $(`.${exampleNumber} .inner-example`).height() + additionalHeight;

                // @TODO inner-example could be named better
                $(`.${exampleNumber} .inner-example`)
                    .css('width', newWidth)
                    .css('height', newHeight);

                return instance.resize(newWidth, newHeight);
            };
        };

        $(`.${exampleNumber} .more-button`).bind('click', newResizeHandler(25, 25));
        $(`.${exampleNumber} .less-button`).bind('click', newResizeHandler(-25, -25));
        $(`.${exampleNumber} .more-width-button`).bind('click', newResizeHandler(25, 0));
        $(`.${exampleNumber} .less-width-button`).bind('click', newResizeHandler(-25, 0));
        $(`.${exampleNumber} .more-height-button`).bind('click', newResizeHandler(0, 25));
        $(`.${exampleNumber} .less-height-button`).bind('click', newResizeHandler(0, -25));
    }

    element.append(innerExampleDiv.append(innerInnerExampleDiv));

    instance.setConfig(templateConfig);
    const instanceId = instance.config['table-id'];
    innerInnerExampleDiv.attr('class', `inner-inner-example ${instanceId}`);

    instance.draw();

    if (exampleConfig.resizeControls) {
        const resizeForm = $(makeFormHtml());
        element.append(resizeForm);

        $(`.${exampleNumber} .resize-form`).bind('submit', function (event) {
            event.preventDefault();
            console.log('resize submit');

            const width = $(`.${exampleNumber} .width-input`).val();
            const height = $(`.${exampleNumber} .height-input`).val();

            // @TODO inner-example could be named better
            $(`.${exampleNumber} .inner-example`)
                .css('width', width)
                .css('height', height);

            instance.resize(width, height);

            return false;
        });
    }
};

const defaultConfig = {
    exW: 100,
    exH: 100,
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

const processRow = function () {
    const row = $(this);

    const rowConfig = _.defaults(row.data(), defaultConfig);

    return $(this).find('.example').each(function () {
        return addExampleTo.bind(this)(rowConfig);
    });
};

$(document).ready(function () {
    addLinkToIndex();
    $('.row').each(processRow);
    return $('body').attr('loaded', '');
});

