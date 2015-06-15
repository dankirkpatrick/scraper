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
        document('.wikitable').eq(0).find('th').each(function(i, elem) {
            columnHeaders[i] = document(elem).text();
        });

        var urlPattern = /href="(.*)"/;
        var marketPattern = /href="https?:\/\/www\.([a-z]*)\./;

        var rowHeaders = [];
        command.result = {};
        document('.wikitable').eq(0).find('tr').each(function(i, elem) {
            var rowData = {};
            document('td', elem).each(function(j, innerElem) {
                if (j === 0) { // 'Ticker symbol'
                    rowHeaders[i] = document(innerElem).text();
                    rowData[columnHeaders[j]] = document(innerElem).text();
                    rowData['Quote Link'] = urlPattern.exec(document(innerElem).html())[1];
                    rowData['Market'] = marketPattern.exec(document(innerElem).html())[1];
                } else if (j === 2) { // 'SEC filings'
                    rowData[columnHeaders[j]] = urlPattern.exec(document(innerElem).html())[1];
                } else {
                    rowData[columnHeaders[j]] = document(innerElem).text();
                }
                if (typeof(rowHeaders[i]) != 'undefined')
                    command.result[rowHeaders[i]] = rowData;
            });
        });

        winston.debug('command:%s finished parsing:%s', command.name, command.parser);
        command.resultMetadata.endTime = new Date();
        scraper.instance.continueCommand(scraper, command);
    }
};