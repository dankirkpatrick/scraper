var fs = require('fs');
var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var location = command.location;
        var filename;
        if (command.filename.charAt(0) == '^')
            filename = scraper.instance.getValue(command, command.filename);
        else
            filename = command.filename;
        var fullFilename = location + filename;

        fs.readFile(fullFilename, function(err, data) {
            if (data instanceof Buffer) {
                command.result = data.toString();
            } else {
                command.result = data;
            }
            command.resultMetadata.endTime = new Date();
            command.resultMetadata.filename = fullFilename;
            command.resultMetadata.error = err;
            winston.info('%s.%s: file:%s loaded successfully', scraper.name, command.name, filename);

            scraper.instance.continueCommand(scraper, command);
        });
    }
};