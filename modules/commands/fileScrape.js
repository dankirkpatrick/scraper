var fs = require('fs');
var cheerio = require('cheerio');
var winston = require('winston');
var vsprintf = require("sprintf-js").vsprintf;

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {{tableRegexIndex: number,
     *          context: String,
     *          name: String,
     *          scrapeTime: Date,
     *          result: Object,
     *          table: String,
     *          html: String,
     *          state: number,
     *          stateIndex, number,
     *          resultMetadata: Object}} command
     */
    doAction: function(scraper, command) {
        command.scrapeTime = new Date();
        var location = command.location;
        if (command.filename.charAt(0) == '^')
            filename = scraper.instance.getValue(command, command.filename);
        else
            filename = command.filename;
        var fullFilename = location + filename;

        winston.debug('command:%s scraping file:%s', command.name, fullFilename);

        fs.readFile(fullFilename, function(err, data) {
            command.resultMetadata.location = location;
            command.resultMetadata.filename = filename;

            if (data instanceof Buffer) {
                command.html = data.toString();
            } else {
                command.html = data;
            }
            winston.info('%s.%s: finished reading file:%s', scraper.name, command.name, filename);
            if (command.domCommands instanceof Array && command.domCommands.length > 0) {
                command.result = cheerio.load(command.html);
                command.state = 100;
                command.stateIndex = 0;
                //console.log(command.context + ': command:' + command.name + '  state:' + command.state + '  index:' + command.stateIndex);
                winston.debug('command:%s starting DOM command at index:0', command.name);
                scraper.instance.startCommand(scraper, command.domCommands[0], command);
            } else {
                command.result = command.html;
                command.resultMetadata.endTime = new Date();
                scraper.instance.continueCommand(scraper, command);
            }
        });
    },
    domAction: function(scraper, command) {
        winston.debug('command:%s starting DOM command at index:%d', command.name, command.stateIndex);
        scraper.instance.startCommand(scraper, command.domCommands[command.stateIndex], command);
    }
};