var fs = require('fs');

var config;

// TODO: Implement me!
module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {Object} command
     * @param {Object} command.re
     * @param {Object} command.result
     * @param {string} command.location
     */
    doAction: function (scraper, command) {
        var re;
        if (typeof(command.regex) != 'undefined') {
            re = new RegExp(command.regex);
        }

        command.result = [];
        fs.readdirSync(command.location).forEach(function(fn) {
            if (typeof(re) != 'undefined') {
                if (re.test(fn)) {
                    command.result = command.result.concat(fn);
                }
            } else if (typeof(command.suffix) != 'undefined') {
                if (fn.indexOf(command.suffix, fn.length - command.suffix.length) !== -1) {
                    var stats = fs.statSync(command.location + fn);
                    if (stats.isFile()) {
                        command.result = command.result.concat(fn);
                    }
                }
            } else {
                command.result = command.result.concat(fn);
            }
        });
                /*
                fs.stat(command.location + fn, function(err, stats) {
                    if (stats.isFile()) {
                        command.results.concat(fn);
                    }
                });
                */
                /*
                var stats = fs.statSync(location + fn);
                if (stats.isFile()) {
                    command.results.concat(fn);
                }
                */

        command.resultMetadata.endTime = new Date();
        command.resultMetadata.location = command.location;
        scraper.instance.continueCommand(scraper, command);
    }
};