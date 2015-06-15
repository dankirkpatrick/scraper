var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        winston.debug('command:%s parsing:%s', command.name, command.parser);
        var document = command.parent.result;
        var columnHeaders = [];
        document('.wikitable').eq(1).find('tr').eq(1).each(function(i, elem) {
            document('td', elem).each(function(j, innerElem) {
                if (j >= 1 && j <= 2) {
                    columnHeaders[j] = 'Added ' + document(innerElem).text();
                } else if (j >= 3 &&  j <= 4) {
                    columnHeaders[j] = 'Removed ' + document(innerElem).text();
                } else {
                    columnHeaders[j] = document(innerElem).text();
                }
            });
        });

        var rowHeaders = [];
        command.result  = {};
        document('.wikitable').eq(1).find('tr').each(function(i, elem) {
            if (i > 1) {
                var rowData = {};
                document('td', elem).each(function(j, innerElem) {
                    if (j === 0) {
                        rowHeaders[i-2] = document(innerElem).text();
                    }
                    rowData[columnHeaders[j]] = document(innerElem).text();
                });
                if (typeof(rowHeaders[i-2]) != 'undefined')
                    command.result[rowHeaders[i-2]] = rowData;
            }
        });

        winston.debug('command:%s finished parsing:%s', command.name, command.parser);
        command.resultMetadata.endTime = new Date();
        scraper.instance.continueCommand(scraper, command);
    }
};