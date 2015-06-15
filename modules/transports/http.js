/////////////////////////////////////////////////////
//      HTTP Communication with GUI Server         //
/////////////////////////////////////////////////////
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
//var methodOverride = require('method-override');

var app = express();
var jsonParser = bodyParser.json();

var guiServerHost = '127.0.0.1';
var guiServerHttpPort = 3000;
var guiServerPostsPath = '/service/posts/';

var scraperServerPort = 3020;

var config;
app.initialize = function(configuration) {
    config = configuration;
};

app.updateScrape = function(id, timestamp, location) {
    var scrapeDetails = JSON.stringify({"dateTime":timestamp, "location": location});
    var options = {
        host: guiServerHost,
        port: guiServerHttpPort,
        path: guiServerPostsPath + id,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(scrapeDetails, 'utf8')
        }
    };

    var req = http.request(options, function(res) {
        if (res.status === '200') {
            winston.debug('HTTP server updated.  Id:%s location:%s', id, location);
        } else {
            winston.error('Error: Update scrape details failed for location: %s', location);
            winston.error('       response:%j', res);
        }
        res.setEncoding('utf8');
        winston.debug('----');
    });

    req.on('error', function(error) {
        winston.error('Problem with request: %j', error);
    });

    req.write(scrapeDetails);
    req.end();
    winston.debug('Updating GUI server for id: %s', id);
};

app.updateParse = function(id, timestamp, table, location) {
    var parseDetails = JSON.stringify({"dateTime":timestamp, "table":table, "location": location});
    var options = {
        host: guiServerHost,
        port: guiServerHttpPort,
        path: guiServerPostsPath + id,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(parseDetails, 'utf8')
        }
    };

    var req = http.request(options, function(res) {
        if (res.status === '200') {
            winston.debug('HTTP server updated.  Id:%s location:%s', id, location);
        } else {
            winston.error('Error: Update scrape details failed for location: ' + location);
            winston.error('       response:%j', res);
        }
        res.setEncoding('utf8');
        winston.debug('----');
    });

    req.on('error', function(error) {
        winston.error('Problem with request: %j', error);
    });

    req.write(parseDetails);
    req.end();
    winston.debug('Updating GUI server for id: %s', id);
};

app.post('/scrape/:scraper', jsonParser, function(req, res) {
    var scraperType = req.params.scraper;
    var scraper = config.getScraper(scraperType);
    scraper.startScraper(req.body);
    res.end(scraper.name + " scraped " + req.body.id);
});

app.post('/parse/:parser', jsonParser, function(req, res) {
    var parserName = req.params.parser;
    var parser = config.getParserCommand(parserName);
    if (parser === null) {
        winston.error('No parser found for: %s', parserName);
    } else {
        parser.parse(req.body);
        res.end('document parsed ' + req.body.id);
    }
});

app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(function(req, res) {
    winston.debug('Body: %s', req.body);
});

//app.use(methodOverride);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.listen(scraperServerPort.toString());
exports = module.exports = app;
winston.debug('Scraper server set up on port %s', scraperServerPort);

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({error: 'Client side error!'});
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', {error: err});
}

