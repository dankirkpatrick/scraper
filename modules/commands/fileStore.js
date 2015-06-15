/////////////////////////////////////////////////////
//                   File I/O                      //
/////////////////////////////////////////////////////
// Library for reading/writing data to disk locally
var fs = require('fs');
var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var location = command.location;
        var suffix = command.suffix;

        if (!fs.existsSync(location)) {
            fs.mkdirSync(location);
        }

        var filename = location + command.parent.resultKey + "." + suffix;
        var content = command.parent.result;
        if (command.filter == 'JSON.stringify') {
            content = JSON.stringify(content);
        }
        winston.debug('command:%s writing file:%s', command.name, filename);
        fs.writeFile(filename, content, function (err) {
            if (err) {
                winston.error('Error writing file: %j', err);
                throw err;
            }
            winston.info('%s.%s: finished writing file:%s', scraper.name, command.name, filename);
            command.result = command.parent.result;
            command.resultMetadata.endTime = new Date();
            command.resultMetadata.filename = filename;
            command.resultMetadata.error = err;

            scraper.instance.continueCommand(scraper, command);
        });
    }
};