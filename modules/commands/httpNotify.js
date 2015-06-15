var http = require('http');
var winston = require('winston');

var config;

// TODO: Implement me!
module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        if (typeof(command.parent) != 'undefined') {
            command.result = command.parent.result;
            command.resultMetadata = command.parent.resultMetadata;
        }
        var message = JSON.stringify(command.resultMetadata);
        var options = {
            host: command.host,
            port: command.port,
            path: command.path + command.parent.resultKey,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(message, 'utf8')
            }
        };
        var req = http.request(options, function (res) {
            if (res.statusCode === 200) {
                winston.debug('Results for command:%s posted to server:%s', command.parent.name, command.host);
            } else {
                winston.error('Error: unable to post results for command:%s to server:%s', command.parent.name, command.host);
                winston.error('     : response: %j', res);
            }
            res.setEncoding('utf8');
            command.resultMetadata.endTime = new Date();
            scraper.instance.continueCommand(scraper, command);
        });

        req.on('error', function (error) {
            winston.error('Problem with request: %j', error);
        });


        req.write(message);
        req.end();
    }
};