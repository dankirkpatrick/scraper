/////////////////////////////////////////////////////
//                   File I/O                      //
/////////////////////////////////////////////////////
// Library for reading/writing data to disk locally
var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    forEachAction: function(scraper, command) {
        command.result = command.forEach[command.stateIndex];
        command.forEachIndex = command.stateIndex;

        if (typeof(scraper.after) != 'undefined' && scraper.after[command.name] instanceof Array && scraper.after[command.name].length > 0) {
            winston.debug('command:%s starting Scraper after command at index: 0', command.name);
            scraper.instance.startCommand(scraper,  scraper.after[command.name][0], command);
        } else if (command.after instanceof Array && command.after.length > 0) {
            winston.debug('command:%s starting Command after command at index: 0', command.name);
            scraper.instance.startCommand(scraper, command.after[0], command);
        } else {
            command.resultMetadata.endTime = new Date();
            scraper.instance.continueCommand(scraper, command);
        }
    },
    doAction: function (scraper, command) {
        var list = scraper.instance.getValue(command, command.list);

        var startIndex = 0;
        if (typeof(command.start) != 'undefined') {
            startIndex = parseInt(command.start);
        }

        if (typeof(list) == 'object') {
            var obj = list;
            list = [];
            var index = 0;
            for (var prop in obj) {
                list[index++] = obj[prop];
            }
        }
        if (list instanceof Array && list.length > startIndex) {
            command.state = 200;
            command.forEach = list;
            command.stateIndex = startIndex - 1;
            command.endIndex = list.length;
            command.result = list[startIndex];
            winston.debug('command:%s state:%s index:%d', command.name, command.state, command.stateIndex);
        }
        if (typeof(command.end) != 'undefined') {
            command.endIndex = parseInt(command.end) + 1;
        }

        command.resultMetadata.startIndex = startIndex;
        command.resultMetadata.endIndex = command.endIndex;
        scraper.instance.continueCommand(scraper, command);
    }
};