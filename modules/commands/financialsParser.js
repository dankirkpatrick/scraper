var winston = require('winston');
var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {Object} command
     * @param {number} command.startId
     * @param {Object} command.result
     * @param {Object} command.resultMetadata
     */
    doAction: function (scraper, command) {
        winston.debug('command:%s: parsing:%s', command.name, command.parser);
        var document = command.parent.result;
        var columnHeaders = command.resultMetadata.columnHeaders = [];
        command.result = {};
        document(command.startId).find('thead tr').eq(0).each(function(i, elem) {
            document('th', elem).each(function(j, innerElem) {
                if (j == 0) {
                    command.resultMetadata.scale = document(innerElem).text().trim().replace(".","");
                } else {
                    columnHeaders[j-1] = document(innerElem).text().trim().replace(".","");
                    command.result[columnHeaders[j-1]] = {};
                }
            });
        });

        var rowHeaders = command.resultMetadata.rowHeaders = [];
        var rowModifiers = command.resultMetadata.rowModifiers = [];
        document(command.startId).find('tbody tr').each(function(i, elem) {
            document('td', elem).each(function(j, innerElem) {
                if (j === 0) {
                    rowHeaders[i] = document(innerElem).text().trim().replace(".","");
                    rowModifiers[i] = '';
                    if (document(elem).hasClass('hilite')) {
                        rowModifiers[i] += ' hilite';
                    }
                    if (document(innerElem).hasClass('bld')) {
                        rowModifiers[i] += ' bld';
                    }
                } else {
                    command.result[columnHeaders[j-1]][rowHeaders[i]] = document(innerElem).text().trim();
                }
            });
        });

        winston.debug('command:%s finished parsing:%s', command.name, command.parser);
        command.resultMetadata.endTime = new Date();
        scraper.instance.continueCommand(scraper, command);
    }
};