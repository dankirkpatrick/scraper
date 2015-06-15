var http = require('http');
var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        winston.info('Starting HTTP store');
        if (typeof(command.parent) != 'undefined') {
            command.result = command.parent.result;
            command.resultMetadata = command.parent.resultMetadata;
        }
        var message = JSON.stringify({result: command.result, resultMetadata: command.resultMetadata});
        winston.info('Inside HTTP store: stringify');
        var options = {
            host: command.host,
            port: command.port,
            path: command.path + command.parent.collection + '/' + command.parent.resultKey,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(message, 'utf8')
            }
        };

        winston.info('Inside HTTP store: request');
        var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                winston.debug('%s: response data:%s', command.name, chunk);
            });

            if (res.statusCode === 200) {
                winston.info('%s.%s: posted result to: http://%s:%s%s', scraper.name, command.name,
                    options.host, options.port, options.path);
            } else {
                winston.error('Error: unable to post results for command:%s to server:%s:%s', command.parent.name, command.host, command.port);
                winston.error('     : response:%j', res);
            }
            command.resultMetadata.endTime = new Date();
            scraper.instance.continueCommand(scraper, command);
        });

        req.on('error', function (error) {
            winston.error('Problem with request: %s', error.message);
            winston.error('stack: %s', error.stack);
            command.resultMetadata.endTime = new Date();
            scraper.instance.continueCommand(scraper, command);
        });

        req.write(message);
        req.end();
        winston.debug('Updating GUI server for command: %s', command.name);
    }
};