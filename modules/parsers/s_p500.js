var cheerio = require('cheerio');
var winston = require('winston');

var config;

module.exports = {
    initialize: function(configuration) {
        config = configuration;
    },
    parse: function (msg) {
        winston.debug("Parsing message");
        winston.debug('id: %s', msg._id);
        winston.debug('title: %s', msg.title);
        winston.debug('location: %s', msg.location);

        msg.filename = msg.location.replace(msg.dir, '');

        var content = config.getDatastore().getDocument(msg.dir, msg.filename);
        var document = cheerio.load(content);

        var components = parseComponents(document);
        var parseTime = new Date();
        config.getDatastore().putDocument(msg.dir, 'components.json', JSON.stringify(components));
        config.getTransport().updateParse(msg.id, parseTime, 'components', msg.dir + 'components.json');

        var changes = parseChanges(document);
        parseTime = new Date();
        config.getDatastore().putDocument(msg.dir, 'changes.json', JSON.stringify(changes));
        config.getTransport().updateParse(msg.id, parseTime, 'changes', msg.dir + 'changes.json');

        winston.debug('Parsing complete');
    }
};

function parseComponents(document) {
    var columnHeaders = [];
    document('.wikitable').eq(0).find('thead th').each(function(i, elem) {
        columnHeaders[i] = document(elem).text();
    });

    var urlPattern = /href="(.*)"/;
    var marketPattern = /href="https?:\/\/www\.([a-z]*)\./;

    var rowHeaders = [];
    var data = {};
    document('.wikitable').eq(0).find('tbody tr').each(function(i, elem) {
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
                data[rowHeaders[i]] = rowData;
        });
    });

    return data;
}

function parseChanges(document) {
    var columnHeaders = [];
    document('.wikitable').eq(1).find('tbody tr').eq(1).each(function(i, elem) {
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
    var data  = {};
    document('.wikitable').eq(1).find('tbody tr').each(function(i, elem) {
        if (i > 1) {
            var rowData = {};
            document('td', elem).each(function(j, innerElem) {
                if (j === 0) {
                    rowHeaders[i-2] = document(innerElem).text();
                }
                rowData[columnHeaders[j]] = document(innerElem).text();
            });
            if (typeof(rowHeaders[i-2]) != 'undefined')
                data[rowHeaders[i-2]] = rowData;
        }
    });

    return data;
}

function parseFinancials(tableId, document) {
    var columnHeaders = [];
    document(tableId).find('thead tr').eq(0).each(function(i, elem) {
        document('th', elem).each(function(j, innerElem) {
            columnHeaders[j] = document(innerElem).text();
        });
    });

    var rowHeaders = [];
    var data = {};
    document(tableId).find('thead tr').each(function(i, elem) {
        if (i > 0) {
            var rowData = {};
            document('td', elem).each(function(j, innerElem) {
                if (j === 0) {
                    rowHeaders[i-1] = document(innerElem).text();
                } else {
                    rowData[columnHeaders[j]] = document(innerElem).text();
                }
            });
            if (typeof(rowHeaders[i-1]) != 'undefined')
                data[rowHeaders[i-1]] = rowData;
        }
    });

    return data;
}

